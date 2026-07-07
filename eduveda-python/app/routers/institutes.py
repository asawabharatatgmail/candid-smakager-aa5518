from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user

router = APIRouter(prefix="/api/institutes", tags=["institutes"])


class InstituteUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    tagline: Optional[str] = None


@router.get("/")
async def list_institutes(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Product Owner":
        raise HTTPException(status_code=403, detail="Access denied")
    result = supabase.table("institutes").select("*").execute()
    return result.data


@router.get("/{institute_id}")
async def get_institute(institute_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("institutes").select("*").eq("id", institute_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Institute not found")
    return result.data[0]


@router.put("/{institute_id}")
async def update_institute(institute_id: str, data: InstituteUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = supabase.table("institutes").update(update_data).eq("id", institute_id).execute()
    return result.data[0] if result.data else {}


@router.get("/{institute_id}/stats")
async def get_institute_stats(institute_id: str, current_user: dict = Depends(get_current_user)):
    students = supabase.table("students").select("id", count="exact").eq("institute_id", institute_id).execute()
    teachers = supabase.table("teachers").select("id", count="exact").eq("institute_id", institute_id).execute()
    branches = supabase.table("branches").select("id", count="exact").eq("institute_id", institute_id).execute()
    classes = supabase.table("academic_classes").select("id", count="exact").eq("institute_id", institute_id).execute()
    leads = supabase.table("leads").select("id", count="exact").eq("institute_id", institute_id).execute()
    return {
        "total_students": students.count or 0,
        "total_teachers": teachers.count or 0,
        "total_branches": branches.count or 0,
        "total_classes": classes.count or 0,
        "total_leads": leads.count or 0,
    }
