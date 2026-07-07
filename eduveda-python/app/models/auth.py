import re
import smtplib
import ssl
import secrets
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..config.settings import settings
from ..config.database import supabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Password ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def validate_password(password: str) -> str:
    """Return error string, or '' if the password meets policy."""
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if len(password) > 64:
        return "Password must not exceed 64 characters."
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter (A-Z)."
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter (a-z)."
    if not re.search(r"\d", password):
        return "Password must contain at least one digit (0-9)."
    if not re.search(r"[!@#$%^&*()\-_=+\[\]{};:'\",.<>?/\\|`~]", password):
        return "Password must contain at least one special character (e.g. !@#$%)."
    return ""


# ── Field validators ──────────────────────────────────────────────────────────

def validate_name(name: str) -> str:
    name = name.strip()
    if len(name) < 2:
        return "Name must be at least 2 characters."
    if len(name) > 100:
        return "Name must not exceed 100 characters."
    if not re.match(r"^[A-Za-z\s\.\-']+$", name):
        return "Name may only contain letters, spaces, hyphens, apostrophes, or dots."
    return ""


def validate_mobile(mobile: str) -> str:
    """Accepts 10-digit Indian mobile starting with 6–9, with optional +91 prefix."""
    clean = re.sub(r"[\s\-\(\)\+]", "", mobile)
    if clean.startswith("91") and len(clean) == 12:
        clean = clean[2:]
    if not re.match(r"^[6-9]\d{9}$", clean):
        return "Mobile must be a valid 10-digit Indian number (e.g. 9876543210)."
    return ""


def validate_city(city: str) -> str:
    if not city:
        return ""
    city = city.strip()
    if len(city) < 2:
        return "City name must be at least 2 characters."
    if len(city) > 60:
        return "City name must not exceed 60 characters."
    if not re.match(r"^[A-Za-z\s\.\-']+$", city):
        return "City may only contain letters and spaces."
    return ""


def validate_institute_name(name: str) -> str:
    name = name.strip()
    if len(name) < 3:
        return "Institute name must be at least 3 characters."
    if len(name) > 120:
        return "Institute name must not exceed 120 characters."
    return ""


def _collect_errors(**kwargs: str) -> list[str]:
    return [msg for msg in kwargs.values() if msg]


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


_ROLE_TABLE = {
    "External Student": "external_students",
    "External Parent":  "external_parents",
    "Class Admin":      "users",
    "Branch Admin":     "users",
    "Teacher":          "users",
    "Student":          "users",
    "Parent":           "users",
    "Product Owner":    "users",
}

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_token(token)
    user_id: str = payload.get("sub", "")
    role: str    = payload.get("role", "")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Use role to go directly to the right table — fast single query, no NoneType risk
    table = _ROLE_TABLE.get(role)
    tables_to_try = [table] if table else list(dict.fromkeys(_ROLE_TABLE.values()))

    for tbl in tables_to_try:
        try:
            result = supabase.table(tbl).select("*").eq("id", user_id).limit(1).execute()
            if result and result.data:
                return {**result.data[0], "_table": tbl}
        except Exception:
            continue

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")


# ── Trial helpers ─────────────────────────────────────────────────────────────

def trial_expiry() -> str:
    """ISO-8601 timestamp for now + TRIAL_DAYS."""
    dt = datetime.now(timezone.utc) + timedelta(days=settings.trial_days)
    return dt.isoformat()


def subscription_days_remaining(expiry_iso: Optional[str]) -> int:
    """Days left in trial/subscription; 0 if expired or None."""
    if not expiry_iso:
        return 0
    try:
        exp = datetime.fromisoformat(expiry_iso.replace("Z", "+00:00"))
        delta = exp - datetime.now(timezone.utc)
        return max(0, delta.days)
    except Exception:
        return 0


# ── Password reset ────────────────────────────────────────────────────────────

def _create_reset_token(email: str, account_type: str) -> str:
    """Generate a signed reset token and store it in DB (single-use, 1 hour)."""
    raw = secrets.token_urlsafe(48)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()

    # Purge stale tokens for this email first
    supabase.table("password_reset_tokens").delete().eq("email", email).execute()

    supabase.table("password_reset_tokens").insert({
        "email": email,
        "token": raw,
        "account_type": account_type,
        "expires_at": expires_at,
        "used": False,
    }).execute()
    return raw


def consume_reset_token(token: str) -> dict:
    """Validate and consume a reset token. Returns {email, account_type}."""
    result = (
        supabase.table("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .eq("used", False)
        .limit(1)
        .execute()
    )
    row = result.data[0] if result.data else None
    if not row:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")

    expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        supabase.table("password_reset_tokens").delete().eq("id", row["id"]).execute()
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    # Mark as used
    supabase.table("password_reset_tokens").update({"used": True}).eq("id", row["id"]).execute()
    return {"email": row["email"], "account_type": row["account_type"]}


# ── Email ─────────────────────────────────────────────────────────────────────

def _send_email(to_email: str, subject: str, html_body: str) -> None:
    if not settings.smtp_user or not settings.smtp_pass:
        # Email not configured — log and skip rather than crashing the API
        print(f"[EMAIL SKIP] SMTP not configured. Would send to {to_email}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"System4Learn <{settings.smtp_user}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls(context=ctx)
        server.login(settings.smtp_user, settings.smtp_pass)
        server.sendmail(settings.smtp_user, to_email, msg.as_string())


def send_password_reset_email(to_email: str, account_type: str) -> None:
    token = _create_reset_token(to_email, account_type)
    reset_url = f"{settings.app_url}/reset-password?token={token}"

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#1e3a8a;font-size:22px;margin:0">System4Learn</h1>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0">AI-Powered Academic Administration</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0">
        <h2 style="color:#1e293b;font-size:18px;margin:0 0 12px">Password Reset Request</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          We received a request to reset the password for <strong>{to_email}</strong>.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin:28px 0">
          <a href="{reset_url}"
             style="background:#2563eb;color:#fff;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
            Reset My Password
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;line-height:1.5">
          If you did not request this, you can safely ignore this email — your password will not change.
          <br>The link will expire automatically after 1 hour.
        </p>
        <p style="color:#94a3b8;font-size:11px;border-top:1px solid #f1f5f9;padding-top:12px;margin-top:16px">
          Or copy this link: <a href="{reset_url}" style="color:#2563eb">{reset_url}</a>
        </p>
      </div>
      <p style="text-align:center;color:#cbd5e1;font-size:11px;margin-top:16px">
        © 2026 System4Learn · system4learn.com
      </p>
    </div>
    """
    _send_email(to_email, "Reset your System4Learn password", html)


def send_trial_welcome_email(to_email: str, name: str, days: int = 7) -> None:
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#1e3a8a;font-size:22px;margin:0">System4Learn</h1>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0">AI-Powered Academic Administration</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0">
        <h2 style="color:#1e293b;font-size:18px;margin:0 0 12px">🎉 Welcome, {name}!</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          Your <strong>{days}-day free trial</strong> has started. Explore every feature with no limits.
        </p>
        <ul style="color:#475569;font-size:13px;line-height:2;padding-left:20px">
          <li>AI-powered quiz &amp; flashcard generation</li>
          <li>Fee management &amp; payment tracking</li>
          <li>Lead pipeline for new admissions</li>
          <li>Multi-role access (Admin, Teacher, Student, Parent)</li>
          <li>Progress reports &amp; gamification</li>
        </ul>
        <div style="background:#eff6ff;border-radius:8px;padding:14px;margin-top:20px">
          <p style="color:#1e40af;font-size:13px;margin:0">
            ⏰ <strong>Trial ends in {days} days.</strong> Upgrade anytime to keep full access.
          </p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="{settings.app_url}"
             style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
            Start Exploring →
          </a>
        </div>
      </div>
      <p style="text-align:center;color:#cbd5e1;font-size:11px;margin-top:16px">
        © 2026 System4Learn · system4learn.com
      </p>
    </div>
    """
    _send_email(to_email, f"Welcome! Your {days}-day free trial has started 🎉", html)
