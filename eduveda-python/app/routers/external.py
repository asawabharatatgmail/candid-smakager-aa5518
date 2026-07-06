"""External Parent & External Student auth and profile endpoints.

Standalone roles — independent of institutes. Every account requires a
real bcrypt-hashed password. New registrations start a 7-day free trial;
one free trial per email address (enforced by unique email constraint).
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from ..config.database import supabase
from ..config.settings import settings
from ..models.auth import (
    hash_password, verify_password, create_access_token, get_current_user,
    validate_password, validate_name, validate_mobile, validate_city,
    trial_expiry, subscription_days_remaining,
    send_password_reset_email, send_trial_welcome_email,
)
from ..services import claude_service

router = APIRouter(prefix="/api/external", tags=["external"])


# ── Shared ────────────────────────────────────────────────────────────────────

class ExternalLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


def _check_subscription(user: dict, role_label: str) -> None:
    """Raise 402 if trial expired or subscription expired."""
    sub = user.get("subscription_status", "none")
    expiry = user.get("subscription_expiry")
    if sub == "trial" and expiry:
        if subscription_days_remaining(str(expiry)) == 0:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Your 7-day free trial has expired. Please upgrade to continue."
            )
    elif sub == "expired":
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Your subscription has expired. Please renew to continue."
        )


# ── Parent ────────────────────────────────────────────────────────────────────

class ExternalParentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: str
    city: Optional[str] = None


@router.post("/parent/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_external_parent(data: ExternalParentRegister, bg: BackgroundTasks):
    errors: list[str] = []

    err = validate_name(data.name)
    if err: errors.append(f"Name: {err}")

    err = validate_password(data.password)
    if err: errors.append(f"Password: {err}")

    err = validate_mobile(data.mobile)
    if err: errors.append(f"Mobile: {err}")

    if data.city:
        err = validate_city(data.city)
        if err: errors.append(f"City: {err}")

    if errors:
        raise HTTPException(status_code=422, detail=" | ".join(errors))

    existing = supabase.table("external_parents").select("id").eq("email", str(data.email)).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    expiry_ts = trial_expiry()
    result = supabase.table("external_parents").insert({
        "name": data.name.strip(),
        "email": str(data.email),
        "mobile": data.mobile,
        "city": data.city,
        "password_hash": hash_password(data.password),
        "subscription_status": "trial",
        "subscription_expiry": expiry_ts,
    }).execute()
    row = result.data[0]

    bg.add_task(send_trial_welcome_email, str(data.email), data.name.strip(), settings.trial_days)

    token = create_access_token({"sub": row["id"], "role": "External Parent"})
    safe_user = {k: v for k, v in row.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@router.post("/parent/login", response_model=TokenResponse)
async def login_external_parent(req: ExternalLoginRequest):
    result = supabase.table("external_parents").select("*").eq("email", str(req.email)).maybe_single().execute()
    user = result.data
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.get("status") == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    _check_subscription(user, "External Parent")

    token = create_access_token({"sub": user["id"], "role": "External Parent"})
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


# ── Student ───────────────────────────────────────────────────────────────────

class ExternalStudentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: Optional[str] = None
    grade: Optional[str] = "General"
    age: Optional[int] = 15
    subjects_of_interest: List[str] = []
    school_name: Optional[str] = None
    city: Optional[str] = None


@router.post("/student/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_external_student(data: ExternalStudentRegister, bg: BackgroundTasks):
    errors: list[str] = []

    err = validate_name(data.name)
    if err: errors.append(f"Name: {err}")

    err = validate_password(data.password)
    if err: errors.append(f"Password: {err}")

    if data.mobile:
        err = validate_mobile(data.mobile)
        if err: errors.append(f"Mobile: {err}")

    if data.city:
        err = validate_city(data.city)
        if err: errors.append(f"City: {err}")

    if data.age is not None and (data.age < 5 or data.age > 30):
        errors.append("Age: Must be between 5 and 30.")

    if errors:
        raise HTTPException(status_code=422, detail=" | ".join(errors))

    existing = supabase.table("external_students").select("id").eq("email", str(data.email)).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    expiry_ts = trial_expiry()
    result = supabase.table("external_students").insert({
        "name": data.name.strip(),
        "email": str(data.email),
        "mobile": data.mobile,
        "grade": data.grade,
        "age": data.age,
        "subjects_of_interest": data.subjects_of_interest,
        "school_name": data.school_name,
        "city": data.city,
        "password_hash": hash_password(data.password),
        "subscription_status": "trial",
        "subscription_expiry": expiry_ts,
    }).execute()
    row = result.data[0]

    bg.add_task(send_trial_welcome_email, str(data.email), data.name.strip(), settings.trial_days)

    token = create_access_token({"sub": row["id"], "role": "External Student"})
    safe_user = {k: v for k, v in row.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@router.post("/student/login", response_model=TokenResponse)
async def login_external_student(req: ExternalLoginRequest):
    result = supabase.table("external_students").select("*").eq("email", str(req.email)).maybe_single().execute()
    user = result.data
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.get("status") == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    _check_subscription(user, "External Student")

    token = create_access_token({"sub": user["id"], "role": "External Student"})
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


# ── Combined login ────────────────────────────────────────────────────────────

class CombinedLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    account_type: str


@router.post("/login", response_model=CombinedLoginResponse)
async def login_external(req: ExternalLoginRequest):
    """Single entry point — tries parent then student."""
    parent = supabase.table("external_parents").select("*").eq("email", str(req.email)).maybe_single().execute()
    if parent.data and verify_password(req.password, parent.data.get("password_hash", "")):
        if parent.data.get("status") == "inactive":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        _check_subscription(parent.data, "External Parent")
        token = create_access_token({"sub": parent.data["id"], "role": "External Parent"})
        safe_user = {k: v for k, v in parent.data.items() if k != "password_hash"}
        return {"access_token": token, "token_type": "bearer", "user": safe_user, "account_type": "parent"}

    student = supabase.table("external_students").select("*").eq("email", str(req.email)).maybe_single().execute()
    if student.data and verify_password(req.password, student.data.get("password_hash", "")):
        if student.data.get("status") == "inactive":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        _check_subscription(student.data, "External Student")
        token = create_access_token({"sub": student.data["id"], "role": "External Student"})
        safe_user = {k: v for k, v in student.data.items() if k != "password_hash"}
        return {"access_token": token, "token_type": "bearer", "user": safe_user, "account_type": "student"}

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_external_me(current_user: dict = Depends(get_current_user)):
    return current_user


# ── Student AI Study Help ──────────────────────────────────────────────────

class AIHelpRequest(BaseModel):
    question: str
    subject: Optional[str] = None


@router.post("/student/ai-help")
async def student_ai_help(req: AIHelpRequest, current_user: dict = Depends(get_current_user)):
    _check_subscription(current_user, "Student")

    if not req.question or not req.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty.")
    if len(req.question) > 2000:
        raise HTTPException(status_code=422, detail="Question is too long (max 2000 characters).")

    subject_ctx = f" in {req.subject}" if req.subject else ""
    prompt = (
        f"You are a helpful, encouraging AI tutor for students. "
        f"Answer the following academic question{subject_ctx} clearly and thoroughly. "
        f"Use simple language, break down complex ideas step by step, and include examples where helpful. "
        f"Keep the answer focused and educational.\n\nQuestion: {req.question.strip()}"
    )

    try:
        answer = await claude_service.simple_answer(prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {exc}")

    return {"answer": answer}
