# EduVeda Ops Agents

Three lightweight Python scripts for daily/weekly operations.
Each requires `ANTHROPIC_API_KEY` (and optionally `API_URL`, `SMTP_*` for health_check).

## Scripts

### 1. `health_check.py` — Run daily
```
python ops-agents/health_check.py
```
Pings backend `/health`, Supabase db field, and Netlify frontend.  
Exits 0 if all OK. Exits 1 and sends an alert email (if SMTP configured) on failure.

Schedule via Windows Task Scheduler or cron:
```
# Windows Task Scheduler action:
python "C:\...\ops-agents\health_check.py"

# Linux/Mac cron (daily at 8 AM):
0 8 * * * cd /path/to/project && python ops-agents/health_check.py
```

### 2. `marketing_draft.py` — Run weekly
```
python ops-agents/marketing_draft.py
```
Reads `git log --since="7 days ago"`, drafts LinkedIn + Twitter + WhatsApp posts and a changelog entry.  
Saves draft to `ops-agents/drafts/marketing_YYYY-MM-DD.md`.  
**Never auto-posts. You review and post manually.**

### 3. `support_triage.py` — Run daily
```
python ops-agents/support_triage.py
```
Reads `ops-agents/support_inbox.json`, categorises and prioritises each request, and drafts a reply.  
Saves draft to `ops-agents/drafts/triage_YYYY-MM-DD.md`.  
**Never sends anything. You copy-paste replies manually.**

## Inbox format for support_triage

Edit `support_inbox.json`:
```json
[
  {
    "id": "001",
    "from": "principal@greenfield.school",
    "subject": "Fee report not loading",
    "body": "When I click the fee report tab it shows a blank screen since this morning.",
    "received_at": "2026-07-01T09:30:00Z"
  }
]
```
Clear the file (reset to `[]`) after each triage run.

## Environment variables

Copy from `eduveda-python/.env.example` and set:

```
ANTHROPIC_API_KEY=sk-ant-...
API_URL=https://eduveda-api.onrender.com
FRONTEND_URL=https://system4learn.com
NOTIFY_EMAIL=asawabharat@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=asawabharat@gmail.com
SMTP_PASS=<app password>
BRAND_NAME=System4Learn
```
