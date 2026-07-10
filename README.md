# EduVeda — Smart Academic Administration & Analytics

An all-in-one platform for educational institutes integrating AI-powered tools for administration, e-learning, and analytics. 

---

## Tech Stack Overview

| Layer | Original (React) | Python Backend | Java Backend |
|---|---|---|---|
| **Language** | TypeScript/React | Python 3.12 | Java 21 |
| **Framework** | Vite/React | FastAPI | Spring Boot 3.3 |
| **AI** | Google Gemini | **Claude (Anthropic)** | **Claude (Anthropic)** |
| **Database** | In-memory state | **Supabase** | **Supabase / PostgreSQL** |
| **Auth** | Context API | JWT (python-jose) | JWT (jjwt) |

---

## Project Structure

```
eduveda_-smart-academic-administration-&-analytics/
├── test/                          # Original React/TypeScript frontend
├── supabase_schema.sql            # Complete Supabase database schema
├── eduveda-python/                # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                # FastAPI app entry point
│   │   ├── config/
│   │   │   ├── settings.py        # Pydantic settings from .env
│   │   │   └── database.py        # Supabase client
│   │   ├── models/
│   │   │   └── auth.py            # JWT auth + password hashing
│   │   ├── routers/
│   │   │   ├── auth.py            # Login, register institute
│   │   │   ├── institutes.py      # Institute CRUD + stats
│   │   │   ├── users.py           # Users, students, teachers
│   │   │   ├── academics.py       # Branches, classes, subjects, attendance, notes
│   │   │   ├── fees.py            # Fee structures, discounts, payments
│   │   │   ├── leads.py           # Lead CRM, reminders, email templates
│   │   │   ├── gamification.py    # Game challenges, submissions
│   │   │   ├── marketing.py       # Google Ads, email campaigns, social posts
│   │   │   └── ai.py              # ALL Claude AI endpoints
│   │   └── services/
│   │       └── claude_service.py  # Claude AI service (replaces Gemini)
│   ├── requirements.txt
│   └── .env.example
└── eduveda-java/                  # Java Spring Boot backend
    ├── pom.xml
    ├── src/main/java/com/eduveda/
    │   ├── EduvedaApplication.java
    │   ├── config/
    │   │   ├── ClaudeConfig.java   # WebClient for Claude API
    │   │   ├── SecurityConfig.java # Spring Security + CORS
    │   │   └── JwtAuthFilter.java  # JWT filter
    │   ├── model/                  # JPA entities
    │   ├── repository/             # Spring Data JPA repositories
    │   ├── service/
    │   │   ├── JwtService.java     # JWT generation/parsing
    │   │   └── ClaudeAiService.java # Claude AI service
    │   ├── controller/
    │   │   ├── AuthController.java
    │   │   ├── AiController.java   # ALL Claude AI endpoints
    │   │   ├── InstituteController.java
    │   │   ├── StudentController.java
    │   │   ├── LeadController.java
    │   │   └── HealthController.java
    │   └── dto/
    │       ├── LoginRequest.java
    │       └── AiRequest.java
    └── src/main/resources/
        ├── application.properties
        └── .env.example
```

---

## Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase_schema.sql`
3. Copy your project credentials from **Settings > API**

The schema includes:
- **Institutes** — multi-tenant root entity
- **Users, Students, Teachers, Parents** — all user types
- **Academic Classes, Subjects, Branches**
- **LMS** — quizzes, flashcards, study materials, videos, documents
- **Attendance Records**
- **Schedule Events**
- **Fee Structures, Discounts, Student Fee Profiles, Receipts**
- **Leads CRM** — leads, reminders, email templates
- **Gamification** — game challenges, levels, submissions
- **Digital Marketing** — Google Ads, email campaigns, social posts
- **Chat Messages, Notifications**
- **AI Chat Sessions** (for conversation history)
- Row Level Security (RLS) enabled on key tables
- Auto-updated `updated_at` triggers

---

## Python FastAPI Backend

### Prerequisites
- Python 3.12+
- pip

### Setup

```bash
cd eduveda-python

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your Supabase and Anthropic credentials

# Run development server
uvicorn app.main:app --reload --port 8000
```

### API Documentation
Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health**: http://localhost:8000/health

---

## Java Spring Boot Backend

### Prerequisites
- Java 21 (JDK)
- Maven 3.9+

### Setup

```bash
cd eduveda-java

# Set environment variables (PowerShell)
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_DB_HOST="db.your-project.supabase.co"
$env:SUPABASE_DB_PASSWORD="your-db-password"
$env:ANTHROPIC_API_KEY="your-anthropic-api-key"
$env:JWT_SECRET="your-secret-min-32-chars"

# Build and run
mvn spring-boot:run
```

### API Endpoints
Once running at http://localhost:8080:
- **Health**: GET /health

---

## Claude AI Features

Both backends implement identical AI features using **Claude claude-sonnet-4-6**:

| Feature | Endpoint | Description |
|---|---|---|
| Quiz Generator | POST /api/ai/quiz/generate | MCQ or True/False quizzes |
| Flashcard Generator | POST /api/ai/flashcards/generate | Educational flashcard sets |
| Study Material Generator | POST /api/ai/study-material/generate | Markdown study guides |
| AI Scheduler | POST /api/ai/schedule/generate | Weekly class timetable |
| Lead Analytics | GET /api/ai/leads/summary | CRM data analysis |
| Email Generator | POST /api/ai/leads/email | Professional lead emails |
| Game Level Generator | POST /api/ai/game/generate | Gamified challenge levels |
| Thought of the Day | GET /api/ai/quote | Inspirational quotes |
| Personalized Insights | POST /api/ai/insight | Role-specific tips |
| AI Help Chatbot | POST /api/ai/help/stream | Platform help (SSE streaming) |
| AI Tutor "Veda" | POST /api/ai/tutor/stream | Subject tutor (SSE streaming) |
| Note Summarizer | POST /api/ai/notes/summarize | Bullet-point summaries |
| Question Generator | POST /api/ai/notes/questions | Study questions from notes |
| Text Explainer | POST /api/ai/explain | Concept explanations |
| Lead Form Script | POST /api/ai/leads/form-script | Google Apps Script generator |

### Prompt Caching
The AI Help Chatbot and Tutor "Veda" use **Anthropic prompt caching** (`cache_control: ephemeral`) on system instructions to reduce latency and API costs for repeated conversations.

---

## Authentication

All endpoints (except `/api/auth/*` and `/health`) require a JWT Bearer token.

```
POST /api/auth/login
{
  "email": "admin@myschool.com",
  "password": "yourpassword"
}
```

Returns:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": "...", "name": "...", "role": "Class Admin", ... }
}
```

Use the token in subsequent requests:
```
Authorization: Bearer eyJ...
```

---

## User Roles

| Role | Access |
|---|---|
| **Product Owner** | Full platform access, all institutes, subscription management |
| **Branch Admin** | Branch-level management, leads, digital marketing |
| **Class Admin** | Students, teachers, classes, fee management |
| **Teacher** | Classes, LMS content creation, attendance, gamification |
| **Student** | LMS, quizzes, flashcards, AI tutor, notes, fee payment |
| **Parent** | Child progress, fee payment, communication |

---

## Environment Variables

### Python (.env)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=your-jwt-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ORIGINS=http://localhost:3000
```

### Java (environment variables)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_DB_HOST=db.xxx.supabase.co
SUPABASE_DB_PASSWORD=your-db-password
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-jwt-secret-min-32-chars
CORS_ORIGINS=http://localhost:3000
```
