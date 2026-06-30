from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routers.auth import router as auth_router
from .routers.institutes import router as institutes_router
from .routers.users import router as users_router, student_router, teacher_router
from .routers.academics import branch_router, class_router, subject_router, attendance_router, notes_router
from .routers.fees import router as fees_router
from .routers.leads import router as leads_router
from .routers.gamification import router as gamification_router
from .routers.marketing import router as marketing_router
from .routers.ai import router as ai_router
from .routers.external import router as external_router

app = FastAPI(
    title="EduVeda API",
    description="Smart Academic Administration & Analytics — powered by Claude AI & Supabase",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router)
app.include_router(institutes_router)
app.include_router(users_router)
app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(branch_router)
app.include_router(class_router)
app.include_router(subject_router)
app.include_router(attendance_router)
app.include_router(notes_router)
app.include_router(fees_router)
app.include_router(leads_router)
app.include_router(gamification_router)
app.include_router(marketing_router)
app.include_router(ai_router)
app.include_router(external_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.app_name, "ai": "Claude (Anthropic)", "db": "Supabase"}
