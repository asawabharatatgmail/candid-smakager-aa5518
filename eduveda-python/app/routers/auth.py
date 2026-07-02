from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr
from ..config.database import supabase
from ..models.auth import (
    verify_password, create_access_token, hash_password,
    validate_password, validate_name, validate_mobile, validate_institute_name,
    consume_reset_token, send_password_reset_email,
    send_trial_welcome_email, trial_expiry, get_current_user,
)
from ..config.settings import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = None
    table_name = None

    for table in ["users", "students", "teachers", "parents"]:
        result = supabase.table(table).select("*").eq("email", req.email).maybe_single().execute()
        if result.data:
            user = result.data
            table_name = table
            break

    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.get("status") == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    # Check institute trial/subscription status for institute users
    if table_name == "users" and user.get("institute_id"):
        inst = supabase.table("institutes").select("subscription_status,subscription_expiry,subscription_expiry_ts").eq("id", user["institute_id"]).maybe_single().execute()
        if inst.data:
            sub = inst.data.get("subscription_status", "inactive")
            expiry = inst.data.get("subscription_expiry_ts") or inst.data.get("subscription_expiry")
            if sub == "trial" and expiry:
                from ..models.auth import subscription_days_remaining
                days_left = subscription_days_remaining(str(expiry))
                if days_left == 0:
                    # Auto-expire trial
                    supabase.table("institutes").update({"subscription_status": "expired"}).eq("id", user["institute_id"]).execute()
                    raise HTTPException(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        detail="Your 7-day free trial has expired. Please upgrade to continue."
                    )
            elif sub == "expired":
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Your subscription has expired. Please renew to continue."
                )

    role = user.get("role", table_name.rstrip("s").capitalize())
    token = create_access_token({"sub": user["id"], "role": role, "institute_id": user.get("institute_id")})
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


class RegisterInstituteRequest(BaseModel):
    institute_name: str
    admin_name: str
    admin_email: EmailStr
    admin_mobile: str
    password: str


@router.post("/register-institute", status_code=status.HTTP_201_CREATED)
async def register_institute(req: RegisterInstituteRequest, bg: BackgroundTasks):
    # ── Validation ──────────────────────────────────────────────────────────
    errors: list[str] = []

    err = validate_institute_name(req.institute_name)
    if err: errors.append(f"Institute name: {err}")

    err = validate_name(req.admin_name)
    if err: errors.append(f"Admin name: {err}")

    err = validate_mobile(req.admin_mobile)
    if err: errors.append(f"Mobile: {err}")

    err = validate_password(req.password)
    if err: errors.append(f"Password: {err}")

    if errors:
        raise HTTPException(status_code=422, detail=" | ".join(errors))

    # ── Duplicate check ──────────────────────────────────────────────────────
    existing = supabase.table("users").select("id").eq("email", str(req.admin_email)).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # ── Create institute with 7-day trial ────────────────────────────────────
    expiry_ts = trial_expiry()
    institute_result = supabase.table("institutes").insert({
        "name": req.institute_name,
        "admin_email": str(req.admin_email),
        "admin_mobile": req.admin_mobile,
        "subscription_status": "trial",
        "subscription_expiry_ts": expiry_ts,
    }).execute()
    institute = institute_result.data[0]

    # ── Create admin user ────────────────────────────────────────────────────
    supabase.table("users").insert({
        "name": req.admin_name,
        "email": str(req.admin_email),
        "mobile": req.admin_mobile,
        "role": "Class Admin",
        "status": "active",
        "password_hash": hash_password(req.password),
        "institute_id": institute["id"],
    }).execute()

    # ── Welcome email (background) ───────────────────────────────────────────
    bg.add_task(
        send_trial_welcome_email,
        str(req.admin_email), req.admin_name, settings.trial_days
    )

    return {
        "message": "Institute registered. Your 7-day free trial has started!",
        "institute_id": institute["id"],
        "trial_days": settings.trial_days,
    }


# ── Forgot / Reset password ───────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password", status_code=202)
async def forgot_password(req: ForgotPasswordRequest, bg: BackgroundTasks):
    """
    Accepts any email — always returns 202 to avoid user enumeration.
    Finds which table the account lives in and emails a reset link.
    """
    email = str(req.email).lower().strip()
    account_type: str | None = None

    for table, atype in [
        ("users",             "institute"),
        ("external_parents",  "external_parent"),
        ("external_students", "external_student"),
    ]:
        result = supabase.table(table).select("id").eq("email", email).maybe_single().execute()
        if result.data:
            account_type = atype
            break

    if account_type:
        bg.add_task(send_password_reset_email, email, account_type)

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    err = validate_password(req.new_password)
    if err:
        raise HTTPException(status_code=422, detail=err)

    info = consume_reset_token(req.token)
    email = info["email"]
    account_type = info["account_type"]

    table_map = {
        "institute":       "users",
        "external_parent": "external_parents",
        "external_student": "external_students",
    }
    table = table_map.get(account_type)
    if not table:
        raise HTTPException(status_code=400, detail="Invalid account type in reset token.")

    result = supabase.table(table).select("id").eq("email", email).maybe_single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Account not found.")

    supabase.table(table).update({
        "password_hash": hash_password(req.new_password)
    }).eq("email", email).execute()

    return {"message": "Password updated successfully. You can now sign in with your new password."}
