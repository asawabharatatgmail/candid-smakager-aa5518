"""
Weekly marketing draft agent — Phase 7, ops routine 2.

Reviews the git log for the past 7 days, then uses Claude to draft
a social media post + changelog entry for your review.

NEVER auto-posts. The draft is printed to stdout and saved to
ops-agents/drafts/marketing_YYYY-MM-DD.md for you to edit and post.

Run weekly: python ops-agents/marketing_draft.py

Environment variables required:
  ANTHROPIC_API_KEY — your Anthropic API key

Optional:
  BRAND_NAME       — defaults to "System4Learn"
  BRAND_AUDIENCE   — defaults to "coaching institutes and schools in India"
"""

import os
import sys
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(1)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
BRAND_NAME        = os.getenv("BRAND_NAME", "System4Learn")
BRAND_AUDIENCE    = os.getenv("BRAND_AUDIENCE", "coaching institutes and schools in India")

DRAFTS_DIR = Path(__file__).parent / "drafts"
DRAFTS_DIR.mkdir(exist_ok=True)


def get_recent_commits(days: int = 7) -> str:
    try:
        result = subprocess.run(
            ["git", "log", f"--since={days} days ago", "--oneline", "--no-merges"],
            capture_output=True, text=True, timeout=10,
        )
        return result.stdout.strip() or "(no commits in the past 7 days)"
    except Exception as e:
        return f"(git log failed: {e})"


def draft_post(commits: str, today: str) -> str:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""You are the marketing writer for {BRAND_NAME}, an AI-powered academic administration platform for {BRAND_AUDIENCE}.

Here are the commits shipped in the past 7 days:
{commits}

Please write:

1. **LinkedIn post** (150–200 words, professional, feature-focused, one call-to-action)
2. **Twitter/X post** (under 280 characters, punchy)
3. **WhatsApp broadcast** (3–4 lines, casual, in Hindi-English mix if you like)
4. **Changelog entry** (bullet list of user-facing changes, plain English)

Ground everything in the actual commits. Do not invent features. If the commits are mostly maintenance or internal, write something honest about reliability improvements.

Today's date: {today}
"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def main() -> None:
    if not ANTHROPIC_API_KEY:
        print("ANTHROPIC_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"=== {BRAND_NAME} Weekly Marketing Draft — {today} ===\n")

    commits = get_recent_commits(7)
    print(f"Commits (past 7 days):\n{commits}\n")
    print("Generating draft with Claude...\n")

    draft = draft_post(commits, today)

    out_path = DRAFTS_DIR / f"marketing_{today}.md"
    out_path.write_text(
        f"# Marketing Draft — {today}\n\n"
        f"## Commits this week\n```\n{commits}\n```\n\n"
        f"## Drafts (review before posting)\n\n{draft}\n",
        encoding="utf-8",
    )

    print(draft)
    print(f"\n--- Draft saved to {out_path} ---")
    print("Review, edit, and post manually. This script never auto-posts.")


if __name__ == "__main__":
    main()
