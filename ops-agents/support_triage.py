"""
Daily support triage agent — Phase 7, ops routine 3.

Reads support requests from a JSON inbox file (populated by the AI Help
Chatbot's "escalate to human" path, or pasted in manually), then uses
Claude to:
  1. Summarize all open requests
  2. Categorise by type (bug / billing / how-to / feature request)
  3. Draft a response for each

Drafts are saved to ops-agents/drafts/triage_YYYY-MM-DD.md.
YOU send the actual replies — this script never sends anything.

Inbox format (ops-agents/support_inbox.json):
[
  {
    "id": "001",
    "from": "principal@greenfield.school",
    "subject": "Students not showing in dashboard",
    "body": "Since yesterday...",
    "received_at": "2026-07-01T09:30:00Z"
  }
]

Run daily: python ops-agents/support_triage.py

Environment variables required:
  ANTHROPIC_API_KEY
"""

import os
import sys
import json
from datetime import datetime, timezone
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(1)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
INBOX_FILE  = Path(__file__).parent / "support_inbox.json"
DRAFTS_DIR  = Path(__file__).parent / "drafts"
DRAFTS_DIR.mkdir(exist_ok=True)

PRODUCT_CONTEXT = """
System4Learn is an AI-powered academic administration platform for coaching institutes and schools.
Key features: multi-role login (Product Owner, Class Admin, Branch Admin, Teacher, Student, Parent,
External Parent, External Student), fee management, lead pipeline, AI quiz + flashcard generation,
progress reports, gamification challenges.
Backend: FastAPI + Supabase. Frontend: React + Vite. Live at system4learn.com.
"""


def load_inbox() -> list[dict]:
    if not INBOX_FILE.exists():
        INBOX_FILE.write_text("[]", encoding="utf-8")
        return []
    return json.loads(INBOX_FILE.read_text(encoding="utf-8"))


def triage(requests: list[dict]) -> str:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    formatted = "\n\n".join(
        f"ID: {r['id']}\nFrom: {r.get('from', 'unknown')}\n"
        f"Subject: {r.get('subject', '')}\nBody: {r.get('body', '')}\n"
        f"Received: {r.get('received_at', '')}"
        for r in requests
    )

    prompt = f"""You are the support lead for System4Learn.

Product context:
{PRODUCT_CONTEXT}

Today's open support requests:
{formatted}

For each request:
1. Category: Bug | Billing | How-To | Feature Request | Spam/Ignore
2. Priority: High | Medium | Low
3. One-sentence root cause or summary
4. Draft reply (friendly, under 100 words, reference the actual issue, sign off as "System4Learn Support Team")

Format each entry clearly with headers. Do not invent information — if you are unsure of the root cause, say so in the draft.
"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def main() -> None:
    if not ANTHROPIC_API_KEY:
        print("ANTHROPIC_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"=== Support Triage — {today} ===\n")

    requests = load_inbox()
    if not requests:
        print(f"Inbox is empty ({INBOX_FILE}).")
        print("Add support requests to that file and re-run.")
        return

    print(f"Found {len(requests)} open request(s). Triaging with Claude...\n")

    result = triage(requests)

    out_path = DRAFTS_DIR / f"triage_{today}.md"
    out_path.write_text(
        f"# Support Triage — {today}\n"
        f"**{len(requests)} request(s) processed**\n\n"
        f"{result}\n\n"
        "---\n"
        "_Review each draft reply above, edit as needed, and send manually._\n"
        "_Never auto-sent by this script._\n",
        encoding="utf-8",
    )

    print(result)
    print(f"\n--- Triage saved to {out_path} ---")
    print("Copy-paste the draft replies into your email/WhatsApp. Do not auto-send.")


if __name__ == "__main__":
    main()
