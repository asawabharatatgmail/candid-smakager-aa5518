from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from pydantic import BaseModel
from ..config.database import supabase
from ..models.auth import verify_password, create_access_token, hash_password

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

    role = user.get("role", table_name.rstrip("s").capitalize())
    token = create_access_token({"sub": user["id"], "role": role, "institute_id": user.get("institute_id")})

    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


class RegisterInstituteRequest(BaseModel):
    institute_name: str
    admin_name: str
    admin_email: str
    admin_mobile: str
    password: str


@router.post("/register-institute", status_code=status.HTTP_201_CREATED)
async def register_institute(req: RegisterInstituteRequest):
    existing = supabase.table("users").select("id").eq("email", req.admin_email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    institute_result = supabase.table("institutes").insert({
        "name": req.institute_name,
        "admin_email": req.admin_email,
        "admin_mobile": req.admin_mobile,
        "subscription_status": "inactive",
    }).execute()
    institute = institute_result.data[0]

    supabase.table("users").insert({
        "name": req.admin_name,
        "email": req.admin_email,
        "mobile": req.admin_mobile,
        "role": "Class Admin",
        "status": "active",
        "password_hash": hash_password(req.password),
        "institute_id": institute["id"],
    }).execute()

    return {"message": "Institute registered successfully", "institute_id": institute["id"]}
