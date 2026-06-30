"""
Academic management: branches, classes, subjects, attendance, notes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user

# ─── Branches ────────────────────────────────────────────────────────────────
branch_router = APIRouter(prefix="/api/branches", tags=["branches"])


class BranchCreate(BaseModel):
    name: str
    location: str
    head: Optional[str] = None
    institute_id: str


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    head: Optional[str] = None


@branch_router.get("/")
async def list_branches(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("branches").select("*").eq("institute_id", iid).execute().data


@branch_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_branch(data: BranchCreate, current_user: dict = Depends(get_current_user)):
    result = supabase.table("branches").insert(data.model_dump()).execute()
    return result.data[0]


@branch_router.put("/{branch_id}")
async def update_branch(branch_id: str, data: BranchUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("branches").update(update_data).eq("id", branch_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Branch not found")
    return result.data[0]


@branch_router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(branch_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("branches").delete().eq("id", branch_id).execute()


# ─── Academic Classes ─────────────────────────────────────────────────────────
class_router = APIRouter(prefix="/api/classes", tags=["classes"])


class ClassCreate(BaseModel):
    name: str
    institute_id: str


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    teacher_ids: Optional[List[str]] = None
    student_ids: Optional[List[str]] = None


@class_router.get("/")
async def list_classes(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("academic_classes").select("*").eq("institute_id", iid).execute().data


@class_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_class(data: ClassCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("academic_classes").insert(data.model_dump()).execute().data[0]


@class_router.put("/{class_id}")
async def update_class(class_id: str, data: ClassUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("academic_classes").update(update_data).eq("id", class_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Class not found")
    return result.data[0]


@class_router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(class_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("academic_classes").delete().eq("id", class_id).execute()


# ─── Subjects ─────────────────────────────────────────────────────────────────
subject_router = APIRouter(prefix="/api/subjects", tags=["subjects"])


class SubjectCreate(BaseModel):
    name: str
    category: str = "General"
    institute_id: str


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None


@subject_router.get("/")
async def list_subjects(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("subjects").select("*").eq("institute_id", iid).execute().data


@subject_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_subject(data: SubjectCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("subjects").insert(data.model_dump()).execute().data[0]


@subject_router.put("/{subject_id}")
async def update_subject(subject_id: str, data: SubjectUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("subjects").update(update_data).eq("id", subject_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Subject not found")
    return result.data[0]


@subject_router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("subjects").delete().eq("id", subject_id).execute()


# ─── Attendance ────────────────────────────────────────────────────────────────
attendance_router = APIRouter(prefix="/api/attendance", tags=["attendance"])


class AttendanceRecord(BaseModel):
    student_id: str
    subject_id: str
    date: str
    status: str = "Present"
    institute_id: str


class BulkAttendanceRequest(BaseModel):
    records: List[AttendanceRecord]


@attendance_router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def mark_bulk_attendance(req: BulkAttendanceRequest, current_user: dict = Depends(get_current_user)):
    records = [r.model_dump() for r in req.records]
    result = supabase.table("attendance_records").upsert(records, on_conflict="student_id,subject_id,date").execute()
    return {"marked": len(result.data)}


@attendance_router.get("/student/{student_id}")
async def get_student_attendance(student_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("attendance_records").select("*").eq("student_id", student_id).order("date", desc=True).execute()
    return result.data


@attendance_router.get("/class/{class_id}")
async def get_class_attendance(class_id: str, date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    students = supabase.table("students").select("id,name").eq("class_id", class_id).execute().data
    student_ids = [s["id"] for s in students]
    query = supabase.table("attendance_records").select("*").in_("student_id", student_ids)
    if date:
        query = query.eq("date", date)
    return query.execute().data


# ─── Notes ────────────────────────────────────────────────────────────────────
notes_router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteCreate(BaseModel):
    title: str
    content: str
    student_id: str


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


@notes_router.get("/student/{student_id}")
async def list_notes(student_id: str, current_user: dict = Depends(get_current_user)):
    return supabase.table("notes").select("*").eq("student_id", student_id).order("updated_at", desc=True).execute().data


@notes_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_note(data: NoteCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("notes").insert(data.model_dump()).execute().data[0]


@notes_router.put("/{note_id}")
async def update_note(note_id: str, data: NoteUpdate, current_user: dict = Depends(get_current_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    return supabase.table("notes").update(update).eq("id", note_id).execute().data[0]


@notes_router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("notes").delete().eq("id", note_id).execute()
