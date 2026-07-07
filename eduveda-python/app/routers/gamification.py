"""
Gamification: challenges, submissions, leaderboard.
"""
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from ..config.database import supabase
from ..models.auth import get_current_user

router = APIRouter(prefix="/api/gamification", tags=["gamification"])


class ChallengeSubmissionCreate(BaseModel):
    challenge_id: str
    student_id: str
    score: float
    time_taken_seconds: int


@router.get("/challenges")
async def list_challenges(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    return supabase.table("game_challenges").select("*, game_levels(*)").eq("institute_id", iid).execute().data


@router.get("/challenges/{challenge_id}")
async def get_challenge(challenge_id: str, current_user: dict = Depends(get_current_user)):
    _r = supabase.table("game_challenges").select("*, game_levels(*)").eq("id", challenge_id).limit(1).execute()
    return _r.data[0] if _r.data else None


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_challenge(data: ChallengeSubmissionCreate, current_user: dict = Depends(get_current_user)):
    return supabase.table("challenge_submissions").insert(data.model_dump()).execute().data[0]


@router.get("/leaderboard/{challenge_id}")
async def get_leaderboard(challenge_id: str, current_user: dict = Depends(get_current_user)):
    return supabase.table("challenge_submissions").select("*, students(name)").eq("challenge_id", challenge_id).order("score", desc=True).limit(20).execute().data


@router.delete("/challenges/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge(challenge_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("game_challenges").delete().eq("id", challenge_id).execute()
