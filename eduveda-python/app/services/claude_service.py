"""
Claude AI service — replaces all Gemini AI calls with Anthropic Claude.
Uses claude-sonnet-4-6 for high-quality outputs with prompt caching on
long system instructions to reduce latency and cost.
"""
import json
from typing import Optional, AsyncGenerator
import anthropic
from ..config.settings import settings

_api_key = settings.anthropic_api_key
_key_missing = not _api_key or _api_key.startswith("PASTE_YOUR")

client = anthropic.Anthropic(api_key=_api_key) if not _key_missing else None

MODEL = "claude-sonnet-4-6"


def _require_client():
    if _key_missing or client is None:
        raise RuntimeError(
            "Anthropic API key is not configured. "
            "Add ANTHROPIC_API_KEY=sk-ant-... to eduveda-python/.env and restart the server."
        )


# ─── Quiz Generation ────────────────────────────────────────────────────────

async def generate_mcq_quiz(topic: str, num_questions: int, difficulty: str, quiz_type: str) -> dict:
    _require_client()
    is_true_false = quiz_type == "True / False"
    options_instruction = "Each question must have exactly 2 options: ['True', 'False']." if is_true_false else "Each question must have exactly 4 options."

    prompt = f"""Generate a {quiz_type} quiz with {num_questions} questions on the topic "{topic}".
Difficulty level: {difficulty}.
{options_instruction}

Return ONLY a valid JSON object matching this exact structure:
{{
  "quizTitle": "Creative quiz title",
  "questions": [
    {{
      "questionText": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0
    }}
  ]
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(message.content[0].text)


# ─── Flashcard Generation ────────────────────────────────────────────────────

async def generate_flashcards(topic: str, num_flashcards: int) -> dict:
    _require_client()
    prompt = f"""Generate a set of {num_flashcards} educational flashcards on the topic "{topic}".
Each flashcard has a front (term/question) and back (definition/answer).

Return ONLY valid JSON:
{{
  "title": "Flashcard set title",
  "flashcards": [
    {{"front": "Term or question", "back": "Definition or answer"}}
  ]
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(message.content[0].text)


# ─── Study Material Generation ───────────────────────────────────────────────

async def generate_study_material(topic: str, grade_level: str, difficulty: str) -> dict:
    _require_client()
    prompt = f"""Generate a detailed study guide on "{topic}" for a {grade_level} student at {difficulty} difficulty.
Use markdown formatting with headings (#, ##), bullet points (*), and bold (**text**).

Return ONLY valid JSON:
{{
  "title": "Clear study guide title",
  "content": "Full markdown content here..."
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(message.content[0].text)


# ─── AI Schedule Generator ───────────────────────────────────────────────────

async def generate_schedule(classes: list, teachers: list, subjects: list, rules: list) -> list:
    _require_client()
    rules_str ="\n".join(
        f"- {next((s['name'] for s in subjects if s['id'] == r['subjectId']), 'Unknown')}: {r['lecturesPerWeek']} lectures/week"
        for r in rules
    )

    prompt = f"""You are an expert school scheduler. Create a weekly class schedule.
Schedule Monday-Friday, 09:00-16:00. Each lecture is 1 hour. Lunch break: 12:00-13:00 (no lectures).

Classes: {json.dumps([{"id": c["id"], "name": c["name"]} for c in classes])}
Teachers: {json.dumps([{"id": t["id"], "name": t["name"], "subjectIds": t["subject_ids"]} for t in teachers])}
Subjects: {json.dumps([{"id": s["id"], "name": s["name"]} for s in subjects])}

Rules:
{rules_str}

Hard constraints:
- Teacher teaches one class at a time
- Class has one lecture at a time
- Teacher must be qualified for the subject

Return ONLY a JSON array:
[{{"day":"Monday","startTime":"09:00","endTime":"10:00","classId":"...","subjectId":"...","teacherId":"..."}}]"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    text = message.content[0].text.strip()
    start = text.find("[")
    end = text.rfind("]") + 1
    return json.loads(text[start:end])


# ─── Lead Analytics ───────────────────────────────────────────────────────────

async def generate_lead_summary(leads: list) -> dict:
    _require_client()
    leads_data = "; ".join(f"Status:{l['status']},Source:{l['source']},Date:{l['added_date']}" for l in leads)

    prompt = f"""You are an expert CRM analyst for an educational institute.
Analyze this lead data and return a detailed JSON report.

Lead Data: {leads_data}
Total Leads: {len(leads)}

Return ONLY valid JSON:
{{
  "overallSummary": "1-2 sentence overview",
  "statusBreakdown": [
    {{"status": "New", "count": 0, "percentage": 0.0}},
    {{"status": "Contacted", "count": 0, "percentage": 0.0}},
    {{"status": "Qualified", "count": 0, "percentage": 0.0}},
    {{"status": "Lost", "count": 0, "percentage": 0.0}}
  ],
  "conversionRate": 0.0,
  "topPerformingSource": {{"source": "...", "qualifiedLeads": 0, "comment": "..."}},
  "actionableSuggestions": ["suggestion1", "suggestion2"],
  "keyHighlight": "Most interesting insight"
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return json.loads(message.content[0].text)


# ─── Email Generator ─────────────────────────────────────────────────────────

async def generate_email_for_lead(lead: dict, purpose: str) -> dict:
    _require_client()
    prompt = f"""Generate a professional email for a sales lead at an educational institute.

Lead: Name={lead['name']}, Status={lead['status']}
Purpose: {purpose}

Address the lead by first name. Be encouraging and helpful.

Return ONLY valid JSON:
{{
  "subject": "Concise email subject",
  "body": "Full email body with \\n for line breaks"
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(message.content[0].text)


# ─── Game Level Generator ─────────────────────────────────────────────────────

async def generate_game_levels(topic: str, num_levels: int, questions_per_level: int) -> list:
    _require_client()
    prompt = f"""Generate a gamified challenge with {num_levels} progressively harder levels on "{topic}".
Each level has exactly {questions_per_level} MCQ questions with 4 options.

Return ONLY valid JSON array:
[
  {{
    "levelNumber": 1,
    "questions": [
      {{"questionText": "...", "options": ["A","B","C","D"], "correctAnswerIndex": 0}}
    ]
  }}
]"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}]
    )
    text = message.content[0].text.strip()
    start = text.find("[")
    end = text.rfind("]") + 1
    return json.loads(text[start:end])


# ─── Thought of the Day ───────────────────────────────────────────────────────

async def generate_quote() -> str:
    _require_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": "Generate a short unique inspirational thought of the day for a student. Include author if known, else 'Anonymous'. Format: 'The quote.' - Author"
        }],
        temperature=1.0
    )
    return message.content[0].text.strip()


# ─── Personalized Insight ─────────────────────────────────────────────────────

async def generate_personalized_insight(role: str) -> str:
    _require_client()
    prompts = {
        "Teacher": "You are an expert instructional designer. Give a short actionable tip (2-3 sentences) for a teacher on using quizzes or flashcards to reinforce a complex topic. Be encouraging and professional.",
        "Student": "You are a friendly study coach. Give a short motivational study tip (2-3 sentences) for a student. Suggest the Feynman technique or spaced repetition. Be encouraging and positive.",
        "Class Admin": "You are a strategic educational consultant. Give a short insightful suggestion (2-3 sentences) for an administrator on using data to improve student outcomes. Be insightful and professional.",
        "Branch Admin": "You are a strategic educational consultant. Give a short insightful suggestion (2-3 sentences) for an administrator on using data to improve student outcomes. Be insightful and professional.",
        "Parent": "You are a helpful AI assistant for parents. Give a short supportive tip (2-3 sentences) for a parent on engaging with their child about schoolwork. Be friendly and constructive.",
    }
    prompt = prompts.get(role, "Give a motivational message for an education professional.")

    message = client.messages.create(
        model=MODEL,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    return message.content[0].text.strip()


# ─── AI Help Chatbot (streaming) ─────────────────────────────────────────────

HELP_SYSTEM_PROMPT = """You are an AI assistant for the EduVeda educational platform (SAAA).
Your role is to help users understand and use the platform's features.
Answer questions based on the platform context. Be concise and helpful.
Format answers using markdown. If the question is outside platform scope,
politely state you can only answer questions about the platform's features."""

async def stream_ai_help_response(query: str, role: str, context: str) -> AsyncGenerator[str, None]:
    _require_client()
    system = f"""{HELP_SYSTEM_PROMPT}

--- USER ROLE ---
{role}

--- PLATFORM CONTEXT ---
{context}
--- END CONTEXT ---"""

    with client.messages.stream(
        model=MODEL,
        max_tokens=1024,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": query}]
    ) as stream:
        for text in stream.text_stream:
            yield text


# ─── AI Tutor "Veda" (streaming) ─────────────────────────────────────────────

async def stream_ai_tutor_response(query: str, subject: str) -> AsyncGenerator[str, None]:
    _require_client()
    system = f"""You are Veda, an expert AI tutor for {subject}.
Help students understand concepts — guide them, don't just give answers.
Be encouraging, friendly, and patient. Use examples and analogies for high school students.
After explaining, ask a follow-up question to check understanding.
For homework, guide through steps instead of giving direct answers.
Use markdown formatting. Only answer {subject} questions."""

    with client.messages.stream(
        model=MODEL,
        max_tokens=1024,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": query}]
    ) as stream:
        for text in stream.text_stream:
            yield text


# ─── Note Tools ───────────────────────────────────────────────────────────────

async def summarize_note(note_content: str) -> str:
    _require_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Summarize the following text into key points using markdown bullet points:\n\n---\n\n{note_content}"
        }]
    )
    return message.content[0].text.strip()


async def generate_questions_from_note(note_content: str) -> str:
    _require_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Based on the following text, generate 3-5 study questions to test understanding. Format as a numbered markdown list:\n\n---\n\n{note_content}"
        }]
    )
    return message.content[0].text.strip()


async def explain_text(text: str) -> str:
    _require_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f'Explain the following concept simply for a high school student. Use markdown if helpful:\n\n---\n\n"{text}"'
        }]
    )
    return message.content[0].text.strip()


# ─── Google Apps Script Generator ────────────────────────────────────────────

async def generate_lead_form_script(fields: list[str]) -> dict:
    _require_client()
    prompt = f"""Generate Google Apps Script code for a web-based lead capture form.
The form submits to a Google Sheet named "Leads".
Fields to collect: {', '.join(fields)}

Return ONLY valid JSON:
{{
  "Code.gs": "// Complete Apps Script backend code...",
  "Index.html": "<!-- Complete HTML form with CSS -->"
}}

Code.gs must have: doGet() to serve HTML, doPost() to append row to sheet with header row if missing.
Index.html must have: clean CSS styling, success message after submission."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(message.content[0].text)
