"""
Daily health check agent — Phase 7, ops routine 1.

Pings:
  1. Render backend (/health)
  2. Netlify frontend (system4learn.com)
  3. Supabase connectivity (via backend /health db field)

Sends a push notification ONLY on failure.
Run daily: python ops-agents/health_check.py

Environment variables required (copy from .env.example):
  API_URL      — e.g. https://eduveda-api.onrender.com
  FRONTEND_URL — e.g. https://system4learn.com
  NOTIFY_EMAIL — where to send alerts (used in output; wire to your notifier)

Optional (for email-style alerts):
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
"""

import os
import sys
import json
import urllib.request
import urllib.error
import smtplib
import ssl
from datetime import datetime, timezone
from email.mime.text import MIMEText

API_URL      = os.getenv("API_URL",      "https://eduveda-api.onrender.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://system4learn.com")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "")
SMTP_HOST    = os.getenv("SMTP_HOST", "")
SMTP_PORT    = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER    = os.getenv("SMTP_USER", "")
SMTP_PASS    = os.getenv("SMTP_PASS", "")

TIMEOUT_S = 30  # allow Render cold-start


def check(name: str, url: str, expect_json_key: str | None = None) -> dict:
    result = {"name": name, "url": url, "ok": False, "detail": ""}
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "eduveda-health-check/1.0"})
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            body = resp.read().decode()
            result["status"] = resp.status
            if expect_json_key:
                data = json.loads(body)
                result["ok"] = expect_json_key in data
                result["detail"] = json.dumps(data)
            else:
                result["ok"] = resp.status < 400
                result["detail"] = f"HTTP {resp.status}"
    except urllib.error.HTTPError as e:
        result["status"] = e.code
        result["detail"] = f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        result["detail"] = str(e)
    return result


def send_alert(subject: str, body: str) -> None:
    print(f"\n[ALERT] {subject}\n{body}", file=sys.stderr)
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL]):
        print("[ALERT] SMTP not configured — alert printed to stderr only.", file=sys.stderr)
        return
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = NOTIFY_EMAIL
    ctx = ssl.create_default_context()
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=ctx)
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, [NOTIFY_EMAIL], msg.as_string())
        print(f"[ALERT] Email sent to {NOTIFY_EMAIL}")
    except Exception as e:
        print(f"[ALERT] Failed to send email: {e}", file=sys.stderr)


def main() -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"=== EduVeda Health Check — {now} ===")

    checks = [
        check("Backend /health",      f"{API_URL}/health",   expect_json_key="status"),
        check("Backend /health db",   f"{API_URL}/health",   expect_json_key="db"),
        check("Frontend",             FRONTEND_URL),
    ]

    failures = [c for c in checks if not c["ok"]]

    for c in checks:
        icon = "✓" if c["ok"] else "✗"
        print(f"  {icon} {c['name']}: {c['detail']}")

    if failures:
        names = ", ".join(c["name"] for c in failures)
        details = "\n".join(f"  • {c['name']}: {c['detail']}" for c in failures)
        send_alert(
            f"[EduVeda] Health check FAILED — {names}",
            f"Checked at {now}\n\nFailed:\n{details}\n\nAll results:\n"
            + "\n".join(f"  {'OK' if c['ok'] else 'FAIL'} {c['name']}: {c['detail']}" for c in checks),
        )
        sys.exit(1)
    else:
        print("\nAll checks passed.")


if __name__ == "__main__":
    main()
