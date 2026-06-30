"""
AI endpoints — all powered by Claude (Anthropic).
Streaming endpoints use Server-Sent Events (SSE).
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from ..models.auth import get_current_user
from ..config.database import supabase
from ..services import claude_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 10
    difficulty: str = "Medium"
    quiz_type: str = "Multiple Choice"
    class_id: Optional[str] = None
    subject_id: Optional[str] = None


class FlashcardRequest(BaseModel):
    topic: str
    num_flashcards: int = 10
    class_id: Optional[str] = None
    subject_id: Optional[str] = None


class StudyMaterialRequest(BaseModel):
    topic: str
    grade_level: str = "High School"
    difficulty: str = "Medium"
    class_id: Optional[str] = None
    subject_id: Optional[str] = None


class ScheduleRule(BaseModel):
    subjectId: str
    lecturesPerWeek: int


class ScheduleRequest(BaseModel):
    institute_id: str
    rules: List[ScheduleRule]


class LeadEmailRequest(BaseModel):
    lead_id: str
    purpose: str


class GameRequest(BaseModel):
    topic: str
    num_levels: int = 3
    questions_per_level: int = 5
    class_ids: Optional[List[str]] = []


class InsightRequest(BaseModel):
    role: str


class ChatRequest(BaseModel):
    query: str
    role: str
    session_id: Optional[str] = None


class TutorRequest(BaseModel):
    query: str
    subject: str
    session_id: Optional[str] = None


class NoteToolRequest(BaseModel):
    note_content: str


class ExplainRequest(BaseModel):
    text: str


class LeadFormRequest(BaseModel):
    fields: List[str]


class VideoFindRequest(BaseModel):
    topic: str
    grade_level: str = "High School"


# ─── Quiz ────────────────────────────────────────────────────────────────────

@router.post("/quiz/generate")
async def generate_quiz(req: QuizRequest, current_user: dict = Depends(get_current_user)):
    try:
        quiz_data = await claude_service.generate_mcq_quiz(
            req.topic, req.num_questions, req.difficulty, req.quiz_type
        )
        # Persist quiz to Supabase
        quiz_row = supabase.table("quizzes").insert({
            "quiz_title": quiz_data["quizTitle"],
            "quiz_type": req.quiz_type,
            "topic": req.topic,
            "owner_id": current_user["id"],
            "class_id": req.class_id,
            "subject_id": req.subject_id,
            "institute_id": current_user.get("institute_id"),
        }).execute().data[0]

        questions_to_insert = [
            {
                "quiz_id": quiz_row["id"],
                "question_text": q["questionText"],
                "options": q["options"],
                "correct_answer_index": q["correctAnswerIndex"],
                "order_index": i,
            }
            for i, q in enumerate(quiz_data["questions"])
        ]
        supabase.table("quiz_questions").insert(questions_to_insert).execute()

        return {**quiz_row, "questions": quiz_data["questions"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quiz/list")
async def list_quizzes(current_user: dict = Depends(get_current_user)):
    iid = current_user.get("institute_id")
    result = supabase.table("quizzes").select("*, quiz_questions(*)").eq("institute_id", iid).execute()
    return result.data


# ─── Flashcards ──────────────────────────────────────────────────────────────

@router.post("/flashcards/generate")
async def generate_flashcards(req: FlashcardRequest, current_user: dict = Depends(get_current_user)):
    try:
        data = await claude_service.generate_flashcards(req.topic, req.num_flashcards)
        set_row = supabase.table("flashcard_sets").insert({
            "title": data["title"], "topic": req.topic,
            "owner_id": current_user["id"],
            "class_id": req.class_id, "subject_id": req.subject_id,
            "institute_id": current_user.get("institute_id"),
        }).execute().data[0]

        cards = [
            {"set_id": set_row["id"], "front": f["front"], "back": f["back"], "order_index": i}
            for i, f in enumerate(data["flashcards"])
        ]
        supabase.table("flashcards").insert(cards).execute()
        return {**set_row, "flashcards": data["flashcards"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flashcards/list")
async def list_flashcard_sets(current_user: dict = Depends(get_current_user)):
    iid = current_user.get("institute_id")
    result = supabase.table("flashcard_sets").select("*, flashcards(*)").eq("institute_id", iid).execute()
    return result.data


# ─── Study Materials ─────────────────────────────────────────────────────────

@router.post("/study-material/generate")
async def generate_study_material(req: StudyMaterialRequest, current_user: dict = Depends(get_current_user)):
    try:
        data = await claude_service.generate_study_material(req.topic, req.grade_level, req.difficulty)
        row = supabase.table("study_materials").insert({
            "title": data["title"], "content": data["content"], "topic": req.topic,
            "owner_id": current_user["id"],
            "class_id": req.class_id, "subject_id": req.subject_id,
            "institute_id": current_user.get("institute_id"),
        }).execute().data[0]
        return row
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/study-material/list")
async def list_study_materials(current_user: dict = Depends(get_current_user)):
    iid = current_user.get("institute_id")
    result = supabase.table("study_materials").select("*").eq("institute_id", iid).execute()
    return result.data


# ─── AI Scheduler ────────────────────────────────────────────────────────────

@router.post("/schedule/generate")
async def generate_schedule(req: ScheduleRequest, current_user: dict = Depends(get_current_user)):
    try:
        classes = supabase.table("academic_classes").select("*").eq("institute_id", req.institute_id).execute().data
        teachers = supabase.table("teachers").select("*").eq("institute_id", req.institute_id).execute().data
        subjects = supabase.table("subjects").select("*").eq("institute_id", req.institute_id).execute().data

        events = await claude_service.generate_schedule(
            classes, teachers, subjects, [r.model_dump() for r in req.rules]
        )

        # Clear existing schedule and save new one
        supabase.table("schedule_events").delete().eq("institute_id", req.institute_id).execute()

        to_insert = [
            {**e, "institute_id": req.institute_id, "id": None}
            for e in events
        ]
        # Remove None id keys
        to_insert = [{k: v for k, v in e.items() if k != "id"} for e in to_insert]
        result = supabase.table("schedule_events").insert(to_insert).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schedule/{institute_id}")
async def get_schedule(institute_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("schedule_events").select("*").eq("institute_id", institute_id).execute()
    return result.data


# ─── Lead Analytics ───────────────────────────────────────────────────────────

@router.get("/leads/summary")
async def get_lead_summary(institute_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    iid = institute_id or current_user.get("institute_id")
    leads = supabase.table("leads").select("status,source,added_date").eq("institute_id", iid).execute().data
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found")
    try:
        return await claude_service.generate_lead_summary(leads)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Lead Email ───────────────────────────────────────────────────────────────

@router.post("/leads/email")
async def generate_lead_email(req: LeadEmailRequest, current_user: dict = Depends(get_current_user)):
    lead = supabase.table("leads").select("*").eq("id", req.lead_id).maybe_single().execute().data
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    try:
        return await claude_service.generate_email_for_lead(lead, req.purpose)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Lead Form Script ────────────────────────────────────────────────────────

@router.post("/leads/form-script")
async def generate_lead_form_script(req: LeadFormRequest, current_user: dict = Depends(get_current_user)):
    try:
        return await claude_service.generate_lead_form_script(req.fields)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Game Levels ──────────────────────────────────────────────────────────────

@router.post("/game/generate")
async def generate_game(req: GameRequest, current_user: dict = Depends(get_current_user)):
    try:
        levels = await claude_service.generate_game_levels(req.topic, req.num_levels, req.questions_per_level)
        challenge = supabase.table("game_challenges").insert({
            "title": f"{req.topic} Challenge",
            "topic": req.topic,
            "mode": "Time Attack",
            "class_ids": req.class_ids,
            "owner_id": current_user["id"],
            "institute_id": current_user.get("institute_id"),
        }).execute().data[0]

        level_rows = [
            {"challenge_id": challenge["id"], "level_number": lvl["levelNumber"], "questions": lvl["questions"]}
            for lvl in levels
        ]
        supabase.table("game_levels").insert(level_rows).execute()
        return {**challenge, "levels": levels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Quote & Insight ─────────────────────────────────────────────────────────

@router.get("/quote")
async def get_quote(current_user: dict = Depends(get_current_user)):
    return {"quote": await claude_service.generate_quote()}


@router.post("/insight")
async def get_insight(req: InsightRequest, current_user: dict = Depends(get_current_user)):
    return {"insight": await claude_service.generate_personalized_insight(req.role)}


# ─── AI Help Chatbot (SSE streaming) ─────────────────────────────────────────

@router.post("/help/stream")
async def stream_help(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    CONTEXT = f"EduVeda is an all-in-one educational administration platform with roles: Product Owner, Branch Admin, Class Admin, Teacher, Student, Parent. Features include LMS (quizzes, flashcards, study materials, videos), Fee Management, Lead CRM, Attendance, Scheduler, Gamification, Digital Marketing, and AI-powered tools."

    async def event_stream():
        async for chunk in claude_service.stream_ai_help_response(req.query, req.role, CONTEXT):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── AI Tutor "Veda" (SSE streaming) ─────────────────────────────────────────

@router.post("/tutor/stream")
async def stream_tutor(req: TutorRequest, current_user: dict = Depends(get_current_user)):
    async def event_stream():
        async for chunk in claude_service.stream_ai_tutor_response(req.query, req.subject):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── Note Tools ───────────────────────────────────────────────────────────────

@router.post("/notes/summarize")
async def summarize_note(req: NoteToolRequest, current_user: dict = Depends(get_current_user)):
    return {"summary": await claude_service.summarize_note(req.note_content)}


@router.post("/notes/questions")
async def generate_questions(req: NoteToolRequest, current_user: dict = Depends(get_current_user)):
    return {"questions": await claude_service.generate_questions_from_note(req.note_content)}


@router.post("/explain")
async def explain_text(req: ExplainRequest, current_user: dict = Depends(get_current_user)):
    return {"explanation": await claude_service.explain_text(req.text)}


@router.post("/videos/find")
async def find_videos(req: VideoFindRequest, current_user: dict = Depends(get_current_user)):
    try:
        from anthropic import Anthropic
        from ..config.settings import settings
        client = Anthropic(api_key=settings.anthropic_api_key)
        prompt = f"""List 5 educational YouTube videos about "{req.topic}" for {req.grade_level} students.
Return ONLY a JSON array: [{{"title":"...","url":"https://www.youtube.com/watch?v=..."}}]"""
        msg = client.messages.create(model="claude-sonnet-4-6", max_tokens=1024,
                                      messages=[{"role": "user", "content": prompt}])
        import json, re
        text = msg.content[0].text
        match = re.search(r'\[[\s\S]*\]', text)
        if match:
            return json.loads(match.group())
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
