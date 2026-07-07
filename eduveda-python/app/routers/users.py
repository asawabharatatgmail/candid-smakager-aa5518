from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user, hash_password

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
    name: str
    email: str
    mobile: str
    role: str
    password: str
    institute_id: str
    branch_ids: Optional[List[str]] = []
    status: Optional[str] = "active"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    status: Optional[str] = None
    branch_ids: Optional[List[str]] = None


@router.get("/")
async def list_users(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    result = supabase.table("users").select("id,name,email,mobile,role,status,branch_ids,created_at").eq("institute_id", iid).execute()
    return result.data


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, current_user: dict = Depends(get_current_user)):
    existing = supabase.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already exists")
    result = supabase.table("users").insert({
        "name": data.name, "email": data.email, "mobile": data.mobile,
        "role": data.role, "status": data.status,
        "password_hash": hash_password(data.password),
        "institute_id": data.institute_id, "branch_ids": data.branch_ids,
    }).execute()
    row = result.data[0]
    return {k: v for k, v in row.items() if k != "password_hash"}


@router.get("/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("users").select("id,name,email,mobile,role,status,branch_ids,institute_id").eq("id", user_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]


@router.put("/{user_id}")
async def update_user(user_id: str, data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("users").update(update_data).eq("id", user_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("users").delete().eq("id", user_id).execute()


# ─── Students ────────────────────────────────────────────────────────────────

student_router = APIRouter(prefix="/api/students", tags=["students"])


class StudentCreate(BaseModel):
    name: str
    email: str
    mobile: str
    class_id: Optional[str] = None
    branch_ids: Optional[List[str]] = []
    subject_ids: Optional[List[str]] = []
    institute_id: str
    password: str
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_mobile: Optional[str] = None
    status: Optional[str] = "active"


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    class_id: Optional[str] = None
    branch_ids: Optional[List[str]] = None
    subject_ids: Optional[List[str]] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_mobile: Optional[str] = None
    status: Optional[str] = None


@student_router.get("/")
async def list_students(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    result = supabase.table("students").select("id,name,email,mobile,class_id,status,parent_name,parent_email").eq("institute_id", iid).execute()
    return result.data


@student_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_student(data: StudentCreate, current_user: dict = Depends(get_current_user)):
    result = supabase.table("students").insert({
        "name": data.name, "email": data.email, "mobile": data.mobile,
        "class_id": data.class_id, "branch_ids": data.branch_ids,
        "subject_ids": data.subject_ids, "institute_id": data.institute_id,
        "password_hash": hash_password(data.password),
        "parent_name": data.parent_name, "parent_email": data.parent_email,
        "parent_mobile": data.parent_mobile, "status": data.status,
    }).execute()
    row = result.data[0]
    return {k: v for k, v in row.items() if k != "password_hash"}


@student_router.get("/{student_id}")
async def get_student(student_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("students").select("*").eq("id", student_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return {k: v for k, v in result.data[0].items() if k != "password_hash"}


@student_router.put("/{student_id}")
async def update_student(student_id: str, data: StudentUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("students").update(update_data).eq("id", student_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return {k: v for k, v in result.data[0].items() if k != "password_hash"}


@student_router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("students").delete().eq("id", student_id).execute()


# ─── Teachers ────────────────────────────────────────────────────────────────

teacher_router = APIRouter(prefix="/api/teachers", tags=["teachers"])


class TeacherCreate(BaseModel):
    name: str
    email: str
    mobile: str
    subject_ids: Optional[List[str]] = []
    class_ids: Optional[List[str]] = []
    branch_ids: Optional[List[str]] = []
    institute_id: str
    password: str
    status: Optional[str] = "active"


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    subject_ids: Optional[List[str]] = None
    class_ids: Optional[List[str]] = None
    branch_ids: Optional[List[str]] = None
    status: Optional[str] = None


@teacher_router.get("/")
async def list_teachers(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    result = supabase.table("teachers").select("id,name,email,mobile,subject_ids,class_ids,branch_ids,status").eq("institute_id", iid).execute()
    return result.data


@teacher_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_teacher(data: TeacherCreate, current_user: dict = Depends(get_current_user)):
    result = supabase.table("teachers").insert({
        "name": data.name, "email": data.email, "mobile": data.mobile,
        "subject_ids": data.subject_ids, "class_ids": data.class_ids,
        "branch_ids": data.branch_ids, "institute_id": data.institute_id,
        "password_hash": hash_password(data.password), "status": data.status,
    }).execute()
    row = result.data[0]
    return {k: v for k, v in row.items() if k != "password_hash"}


@teacher_router.put("/{teacher_id}")
async def update_teacher(teacher_id: str, data: TeacherUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("teachers").update(update_data).eq("id", teacher_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {k: v for k, v in result.data[0].items() if k != "password_hash"}


@teacher_router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_teacher(teacher_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("teachers").delete().eq("id", teacher_id).execute()
