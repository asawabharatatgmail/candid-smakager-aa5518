# EduVeda Load Test Runbook

## Scripts

| Script | Hot path | VUs | Duration |
|---|---|---|---|
| `health.js` | Cold-start wake | 1 | 1 iteration |
| `login.js` | Auth (JWT issue) | 500 | ~5.5 min |
| `dashboard.js` | Dashboard batch read | 500 | ~5.5 min |
| `ai_quiz.js` | AI quiz generation | 20 | ~5 min |
| `fee_payment.js` | Fee payment write | 200 | ~6.5 min |

## How to run

```bash
# 1. Wake Render from cold start first (~30 s wait)
"C:\Program Files\k6\k6.exe" run load-tests/health.js

# 2. Login stress test
"C:\Program Files\k6\k6.exe" run load-tests/login.js

# 3. Dashboard read load
"C:\Program Files\k6\k6.exe" run load-tests/dashboard.js

# 4. AI quiz (low VU — rate-limited by Anthropic)
"C:\Program Files\k6\k6.exe" run load-tests/ai_quiz.js

# 5. Fee payment writes
"C:\Program Files\k6\k6.exe" run load-tests/fee_payment.js

# Override base URL for local testing:
"C:\Program Files\k6\k6.exe" run -e BASE_URL=http://localhost:8000 load-tests/login.js
```

## Known bottlenecks and upgrade triggers

### Render free tier (backend)
- **Cold start**: first request after 15 min idle takes 20–60 s. Run `health.js` first in any real user flow.
- **Upgrade trigger**: if p95 login latency > 2 s at 500 VUs, move to Render Starter ($7/mo) — it never sleeps.
- **Signal to watch**: `http_req_duration{p(95)}` in login.js summary.

### Supabase free tier (database)
- **Connection cap**: free tier allows 60 simultaneous Postgres connections. Under 200-VU write load (`fee_payment.js`) this will saturate.
- **Upgrade trigger**: if `fee_db_errors` counter > 5 (5xx errors in fee_payment.js), move to Supabase Pro ($25/mo — 200+ connections, daily backups, PITR).
- **Signal to watch**: `fee_db_errors` in k6 output.

### Anthropic API (AI features)
- **Rate limit**: free / Tier 1 keys are rate-limited to ~5 req/min on Claude models. Under 20 VU AI load this will fire.
- **Upgrade trigger**: if `ai_rate_limit_hits` counter > 10, upgrade to Anthropic Tier 2 ($40 spend required) or add a queue in front of the `/api/ai/` routes.
- **Signal to watch**: `ai_rate_limit_hits` counter in ai_quiz.js summary.

### Thresholds summary

| Metric | Threshold | Action if breached |
|---|---|---|
| `http_req_failed` | < 2% | Investigate 5xx logs on Render |
| `http_req_duration p(95)` | < 2 s | Upgrade Render tier |
| `login_duration p(95)` | < 1.5 s | Optimize bcrypt work factor |
| `dashboard_total_duration p(95)` | < 3 s | Add Supabase indexes or cache |
| `ai_quiz_duration p(95)` | < 30 s | Queue AI requests or upgrade Anthropic tier |
| `fee_payment_duration p(95)` | < 3 s | Upgrade Supabase tier |
| `fee_db_errors count` | < 5 | Upgrade Supabase tier immediately |
| `ai_rate_limit_hits count` | < 10 | Upgrade Anthropic tier |
