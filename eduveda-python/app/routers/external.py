"""External Parent & External Student auth and profile endpoints.

These roles are standalone — not linked to any institute — and are a
separate revenue stream from the institute subscription model. Unlike
the institute auth flow, there is no "blank password = demo mode"
fallback here: every account requires a real password, hashed with
bcrypt, same as institute users/students/teachers/parents.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/external", tags=["external"])


# ── Parent ──────────────────────────────────────────────────────────────────

class ExternalParentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: str
    city: Optional[str] = None


class ExternalLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/parent/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_external_parent(data: ExternalParentRegister):
    existing = supabase.table("external_parents").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    result = supabase.table("external_parents").insert({
        "name": data.name,
        "email": data.email,
        "mobile": data.mobile,
        "city": data.city,
        "password_hash": hash_password(data.password),
    }).execute()
    row = result.data[0]

    token = create_access_token({"sub": row["id"], "role": "External Parent"})
    safe_user = {k: v for k, v in row.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@router.post("/parent/login", response_model=TokenResponse)
async def login_external_parent(req: ExternalLoginRequest):
    result = supabase.table("external_parents").select("*").eq("email", req.email).maybe_single().execute()
    user = result.data
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.get("status") == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    token = create_access_token({"sub": user["id"], "role": "External Parent"})
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


# ── Student ──────────────────────────────────────────────────────────────────

class ExternalStudentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: Optional[str] = None
    grade: str
    age: int
    subjects_of_interest: List[str] = []
    school_name: Optional[str] = None
    city: Optional[str] = None


@router.post("/student/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_external_student(data: ExternalStudentRegister):
    existing = supabase.table("external_students").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    result = supabase.table("external_students").insert({
        "name": data.name,
        "email": data.email,
        "mobile": data.mobile,
        "grade": data.grade,
        "age": data.age,
        "subjects_of_interest": data.subjects_of_interest,
        "school_name": data.school_name,
        "city": data.city,
        "password_hash": hash_password(data.password),
    }).execute()
    row = result.data[0]

    token = create_access_token({"sub": row["id"], "role": "External Student"})
    safe_user = {k: v for k, v in row.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@router.post("/student/login", response_model=TokenResponse)
async def login_external_student(req: ExternalLoginRequest):
    result = supabase.table("external_students").select("*").eq("email", req.email).maybe_single().execute()
    user = result.data
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.get("status") == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    token = create_access_token({"sub": user["id"], "role": "External Student"})
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


class CombinedLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    account_type: str  # "parent" | "student"


@router.post("/login", response_model=CombinedLoginResponse)
async def login_external(req: ExternalLoginRequest):
    """Single entry point used by the login UI — tries parent then student."""
    parent = supabase.table("external_parents").select("*").eq("email", req.email).maybe_single().execute()
    if parent.data and verify_password(req.password, parent.data.get("password_hash", "")):
        if parent.data.get("status") == "inactive":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        token = create_access_token({"sub": parent.data["id"], "role": "External Parent"})
        safe_user = {k: v for k, v in parent.data.items() if k != "password_hash"}
        return {"access_token": token, "token_type": "bearer", "user": safe_user, "account_type": "parent"}

    student = supabase.table("external_students").select("*").eq("email", req.email).maybe_single().execute()
    if student.data and verify_password(req.password, student.data.get("password_hash", "")):
        if student.data.get("status") == "inactive":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        token = create_access_token({"sub": student.data["id"], "role": "External Student"})
        safe_user = {k: v for k, v in student.data.items() if k != "password_hash"}
        return {"access_token": token, "token_type": "bearer", "user": safe_user, "account_type": "student"}

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")


# ── Shared lookup (used by get_current_user-style flows later) ───────────────

@router.get("/me")
async def get_external_me(current_user: dict = Depends(get_current_user)):
    return current_user
