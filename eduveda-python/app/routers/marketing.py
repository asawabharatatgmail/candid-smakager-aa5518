"""
Digital marketing: Google Ads, Email Campaigns, Social Posts.
"""
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import Optional
from ..config.database import supabase
from ..models.auth import get_current_user

router = APIRouter(prefix="/api/marketing", tags=["marketing"])


class GoogleAdCreate(BaseModel):
    name: str
    status: str = "Draft"
    budget: float = 0
    start_date: str
    end_date: str
    institute_id: str


class EmailCampaignCreate(BaseModel):
    name: str
    subject: str
    status: str = "Draft"
    audience_size: int = 0
    institute_id: str


class SocialPostCreate(BaseModel):
    platform: str
    content: str
    scheduled_date: str
    institute_id: str


@router.get("/google-ads")
async def list_google_ads(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("google_ad_campaigns").select("*").eq("institute_id", iid).execute().data


@router.post("/google-ads", status_code=status.HTTP_201_CREATED)
async def create_google_ad(data: GoogleAdCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("google_ad_campaigns").insert(data.model_dump()).execute().data[0]


@router.get("/email-campaigns")
async def list_email_campaigns(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("email_campaigns").select("*").eq("institute_id", iid).execute().data


@router.post("/email-campaigns", status_code=status.HTTP_201_CREATED)
async def create_email_campaign(data: EmailCampaignCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("email_campaigns").insert(data.model_dump()).execute().data[0]


@router.get("/social-posts")
async def list_social_posts(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("social_posts").select("*").eq("institute_id", iid).execute().data


@router.post("/social-posts", status_code=status.HTTP_201_CREATED)
async def create_social_post(data: SocialPostCreate, current_user: dict = Depends(get_current_user)):
    payload = {**data.model_dump(), "status": "Scheduled"}
    return supabase.table("social_posts").insert(payload).execute().data[0]
