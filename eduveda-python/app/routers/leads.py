"""
Lead CRM management: leads, reminders, email templates.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user

router = APIRouter(prefix="/api/leads", tags=["leads"])


class LeadCreate(BaseModel):
    name: str
    email: str
    mobile: str
    source: str = "Website"
    status: str = "New"
    institute_id: str
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None


class ReminderCreate(BaseModel):
    lead_id: str
    date_time: str
    notes: Optional[str] = None


class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    body: str
    status_target: str = "General"
    institute_id: str


@router.get("/")
async def list_leads(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("leads").select("*").eq("institute_id", iid).order("added_date", desc=True).execute().data


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_lead(data: LeadCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("leads").insert(data.model_dump()).execute().data[0]


@router.put("/{lead_id}")
async def update_lead(lead_id: str, data: LeadUpdate, current_user: dict = Depends(get_current_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    return supabase.table("leads").update(update).eq("id", lead_id).execute().data[0]


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("leads").delete().eq("id", lead_id).execute()


# ─── Reminders ────────────────────────────────────────────────────────────────

@router.post("/reminders", status_code=status.HTTP_201_CREATED)
async def create_reminder(data: ReminderCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("lead_reminders").insert(data.model_dump()).execute().data[0]


@router.get("/reminders/{lead_id}")
async def get_reminders(lead_id: str, current_user: dict = Depends(get_current_user)):
    return supabase.table("lead_reminders").select("*").eq("lead_id", lead_id).execute().data


@router.patch("/reminders/{reminder_id}/complete")
async def complete_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
    return supabase.table("lead_reminders").update({"is_completed": True}).eq("id", reminder_id).execute().data[0]


# ─── Email Templates ─────────────────────────────────────────────────────────

@router.get("/email-templates")
async def list_email_templates(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("email_templates").select("*").eq("institute_id", iid).execute().data


@router.post("/email-templates", status_code=status.HTTP_201_CREATED)
async def create_email_template(data: EmailTemplateCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("email_templates").insert(data.model_dump()).execute().data[0]


@router.delete("/email-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_template(template_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("email_templates").delete().eq("id", template_id).execute()
