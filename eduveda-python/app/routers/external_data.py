"""External role's own data: children, personal AI config, saved AI
content, activity sessions, progress reports, and student subscriptions.

Every endpoint scopes reads/writes to current_user["id"] (the JWT
subject). There are no RLS policies on these tables (the backend uses
the service-role key, which bypasses RLS entirely) — so this
application-level scoping is the only access control. Don't remove it.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user

router = APIRouter(prefix="/api/external-data", tags=["external-data"])


# ── Child Profiles ──────────────────────────────────────────────────────────

class ChildProfileCreate(BaseModel):
    name: str
    grade: str
    age: int
    subjects_of_interest: List[str] = []
    school_name: Optional[str] = None
    city: Optional[str] = None
    avatar: Optional[str] = None


@router.get("/children")
async def list_children(current_user: dict = Depends(get_current_user)):
    return supabase.table("external_child_profiles").select("*").eq("parent_id", current_user["id"]).execute().data


@router.post("/children", status_code=status.HTTP_201_CREATED)
async def create_child(data: ChildProfileCreate, current_user: dict = Depends(get_current_user)):
    row = {**data.model_dump(), "parent_id": current_user["id"]}
    return supabase.table("external_child_profiles").insert(row).execute().data[0]


@router.put("/children/{child_id}")
async def update_child(child_id: str, data: ChildProfileCreate, current_user: dict = Depends(get_current_user)):
    existing = supabase.table("external_child_profiles").select("parent_id").eq("id", child_id).maybe_single().execute()
    if not existing.data or existing.data["parent_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    result = supabase.table("external_child_profiles").update(data.model_dump()).eq("id", child_id).execute()
    return result.data[0]


@router.delete("/children/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_child(child_id: str, current_user: dict = Depends(get_current_user)):
    existing = supabase.table("external_child_profiles").select("parent_id").eq("id", child_id).maybe_single().execute()
    if not existing.data or existing.data["parent_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    supabase.table("external_child_profiles").delete().eq("id", child_id).execute()


# ── Personal AI Config ───────────────────────────────────────────────────────

class AiConfigUpsert(BaseModel):
    owner_role: str  # "Student" | "Parent"
    active_provider: str
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    custom_api_key: Optional[str] = None
    custom_api_url: Optional[str] = None
    custom_model_name: Optional[str] = None


@router.get("/ai-config")
async def get_ai_config(current_user: dict = Depends(get_current_user)):
    result = supabase.table("personal_ai_configs").select("*").eq("owner_id", current_user["id"]).maybe_single().execute()
    return result.data


@router.put("/ai-config")
async def upsert_ai_config(data: AiConfigUpsert, current_user: dict = Depends(get_current_user)):
    row = {**data.model_dump(), "owner_id": current_user["id"]}
    result = supabase.table("personal_ai_configs").upsert(row, on_conflict="owner_id").execute()
    return result.data[0]


# ── Saved AI Content ─────────────────────────────────────────────────────────

class AiContentCreate(BaseModel):
    content_type: str
    title: str
    topic: str
    subject_name: str
    class_name: str
    content: str
    is_shared_with_parent: bool = False
    ai_provider: str = "gemini"


@router.get("/ai-content")
async def list_ai_content(current_user: dict = Depends(get_current_user)):
    return supabase.table("saved_ai_content").select("*").eq("owner_id", current_user["id"]).order("generated_at", desc=True).execute().data


@router.post("/ai-content", status_code=status.HTTP_201_CREATED)
async def create_ai_content(data: AiContentCreate, current_user: dict = Depends(get_current_user)):
    row = {**data.model_dump(), "owner_id": current_user["id"]}
    return supabase.table("saved_ai_content").insert(row).execute().data[0]


@router.delete("/ai-content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ai_content(content_id: str, current_user: dict = Depends(get_current_user)):
    existing = supabase.table("saved_ai_content").select("owner_id").eq("id", content_id).maybe_single().execute()
    if not existing.data or existing.data["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    supabase.table("saved_ai_content").delete().eq("id", content_id).execute()


# ── Activity Sessions ────────────────────────────────────────────────────────

class ActivitySessionCreate(BaseModel):
    date: str
    duration_minutes: int
    activity: str
    subject_id: Optional[str] = None
    content_title: Optional[str] = None
    score: Optional[int] = None
    total_questions: Optional[int] = None


@router.get("/activity")
async def list_activity(current_user: dict = Depends(get_current_user)):
    return supabase.table("activity_sessions").select("*").eq("student_id", current_user["id"]).order("date", desc=True).execute().data


@router.post("/activity", status_code=status.HTTP_201_CREATED)
async def log_activity(data: ActivitySessionCreate, current_user: dict = Depends(get_current_user)):
    row = {**data.model_dump(), "student_id": current_user["id"]}
    return supabase.table("activity_sessions").insert(row).execute().data[0]


# ── AI Progress Reports ──────────────────────────────────────────────────────

class ProgressReportCreate(BaseModel):
    period_label: str
    summary: str
    strengths: List[str] = []
    areas_to_improve: List[str] = []
    study_recommendations: List[str] = []
    weekly_time_spent: List[dict] = []
    subject_scores: List[dict] = []
    overall_score: int
    attendance_percent: int


@router.get("/progress-reports")
async def list_progress_reports(current_user: dict = Depends(get_current_user)):
    return supabase.table("ai_progress_reports").select("*").eq("student_id", current_user["id"]).order("generated_at", desc=True).execute().data


@router.post("/progress-reports", status_code=status.HTTP_201_CREATED)
async def create_progress_report(data: ProgressReportCreate, current_user: dict = Depends(get_current_user)):
    row = {**data.model_dump(), "student_id": current_user["id"]}
    return supabase.table("ai_progress_reports").insert(row).execute().data[0]


# ── Student Plans (public catalog) & Subscriptions ───────────────────────────

@router.get("/student-plans")
async def list_student_plans():
    return supabase.table("student_plans").select("*").eq("is_active", True).execute().data


class StudentSubscriptionCreate(BaseModel):
    plan_id: str
    status: str
    start_date: str
    expiry_date: str
    payment_mode: str
    amount_paid: float
    auto_renew: bool = True


@router.get("/student-subscriptions/me")
async def get_my_subscription(current_user: dict = Depends(get_current_user)):
    result = (
        supabase.table("student_subscriptions")
        .select("*")
        .eq("student_id", current_user["id"])
        .eq("status", "active")
        .maybe_single()
        .execute()
    )
    return result.data


@router.post("/student-subscriptions", status_code=status.HTTP_201_CREATED)
async def create_student_subscription(data: StudentSubscriptionCreate, current_user: dict = Depends(get_current_user)):
    row = {**data.model_dump(), "student_id": current_user["id"]}
    return supabase.table("student_subscriptions").insert(row).execute().data[0]
