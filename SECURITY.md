# EduVeda / System4Learn — Security Reference

> Last updated: 2026-07-01  
> Covers the deployed stack: FastAPI backend on Render + React frontend on Netlify + Supabase Postgres.

---

## 1. Authentication Model

### Algorithm and Token Lifetime
| Setting | Value |
|---|---|
| Algorithm | HS256 (HMAC-SHA256) |
| Token lifetime | 480 minutes (8 hours) |
| Token type | Stateless JWT (no refresh tokens) |
| Password hashing | bcrypt (direct, cost factor 12) |

The `SECRET_KEY` used to sign JWTs is a 64-hex-char random string generated at deploy time and stored as a Render environment variable. It is never committed to git.

### Role Model
Eight roles with distinct privilege levels:

| Role | Type | Notes |
|---|---|---|
| Product Owner | Institute | Platform-wide; manages all institutes |
| Class Admin | Institute | Full access to one institute |
| Branch Admin | Institute | Scoped to assigned branches |
| Teacher | Institute | Scoped to assigned classes |
| Student | Institute | Read-own data; submit quizzes |
| Parent | Institute | Read child's fee/attendance data |
| External Parent | Standalone | Independent; manages child profiles |
| External Student | Standalone | Independent; personal AI study tools |

Role is embedded in the JWT payload and enforced by FastAPI dependency injection (`get_current_user` in `app/models/auth.py`). The backend never trusts role claims from request bodies — only from the signed JWT.

### Password Policy
- Minimum: no enforced minimum in the current schema (acceptable for MVP; harden before public launch if required)
- Storage: bcrypt with random salt per hash; plaintext is never stored or logged
- Reset: not yet implemented — manual admin reset via Supabase dashboard until a reset flow is added

### What We Do Not Do
- Passwords are never logged or included in API responses (`safe_user` strips `password_hash` before returning the user object in auth.py)
- Passwords are never stored in JWTs
- The service-role key is never sent to the frontend

---

## 2. Secrets Management

All production secrets live exclusively as Render environment variables. Nothing sensitive is committed to git.

| Secret | Location | Rotation |
|---|---|---|
| `SECRET_KEY` (JWT signing) | Render env var | Rotate → redeploy; all active sessions invalidated |
| `SUPABASE_SERVICE_ROLE_KEY` | Render env var | Rotate in Supabase dashboard → update Render env var |
| `SUPABASE_ANON_KEY` | Render env var + Netlify env var | Anon key is intentionally public-safe but rotate after any exposure |
| `ANTHROPIC_API_KEY` | Render env var | Rotate in Anthropic console → update Render env var |

**Files:**
- `eduveda-python/.env` — gitignored; local dev only
- `test/.env`, `test/.env.local` — gitignored; local dev only
- `render.yaml` — uses `sync: false` for all secret fields (no values in YAML)
- `.env.example` files — committed, contain only placeholder values

**What to do if a key is exposed:**
1. Rotate the key immediately in the relevant dashboard (Supabase / Anthropic / Render)
2. Update the Render environment variable
3. Trigger a manual deploy on Render so the new key takes effect
4. If `SECRET_KEY` is exposed, all active JWT sessions become invalid after rotation — users will be logged out

---

## 3. Row Level Security (RLS)

The backend uses Supabase's service-role key, which bypasses RLS. Row-level isolation is therefore enforced at the **API layer** (FastAPI auth middleware + `institute_id` scoping on every query) rather than at the DB layer.

RLS is enabled on a subset of tables as a **defense-in-depth layer** — it would prevent direct Supabase client calls from accessing data even if the anon key were misused.

### Tables with RLS enabled
`institutes`, `branches`, `users`, `students`, `teachers`, `leads`, `quizzes`, `study_materials`, `notes`

### Tables without RLS (API-layer protection only)
All remaining tables (~35): `subscription_packages`, `addons`, `app_settings`, `class_teachers`, `subjects`, `academic_classes`, `parents`, `lead_reminders`, `email_templates`, `quiz_questions`, `quiz_submissions`, `flashcard_sets`, `flashcards`, `videos`, `uploaded_documents`, `attendance_records`, `schedule_events`, `fee_structures`, `fee_structure_installments`, `discounts`, `student_fee_profiles`, `student_installments`, `student_applied_discounts`, `fee_receipts`, `google_ad_campaigns`, `email_campaigns`, `social_posts`, `notifications`, `game_challenges`, `game_levels`, `challenge_submissions`, `chat_messages`, `ai_chat_sessions`, external role tables.

**Risk:** Any future direct-Supabase integration (e.g. Supabase Realtime, Edge Functions, or a new client-side service) would need to add RLS to these tables before going live. The backend service is the only current consumer of the DB, so this is acceptable for now.

**Recommended next step:** Enable RLS on all tables with `institute_id` columns and add policies of the form `USING (institute_id = auth.jwt() ->> 'institute_id')` before adding any second DB consumer.

---

## 4. XSS Prevention

### Fix applied (Phase 0)
`components/views/ParentReportsView.tsx` previously used `dangerouslySetInnerHTML` with hand-rolled regex-based markdown bold replacement. This was replaced with `react-markdown` + `remark-gfm`, which renders via the React virtual DOM and never calls `innerHTML`.

### Current stance
- All AI-generated content is rendered through `react-markdown` — no raw HTML injection
- DOMPurify is a transitive dependency (pulled in by build tooling) but is **not called directly** by any application code. The vulnerabilities reported by `npm audit` against DOMPurify are all in its `IN_PLACE`, `ADD_TAGS`, and `USE_PROFILES` modes, none of which EduVeda uses
- User-supplied text (names, notes, chat messages) is stored as plain text in Supabase and rendered as text nodes in React — no `innerHTML` paths
- CSP header: not yet configured at Netlify level (planned — add a `netlify.toml` `[[headers]]` block with a strict CSP before onboarding schools)

---

## 5. HTTPS and CORS

| Layer | TLS | Notes |
|---|---|---|
| Frontend (Netlify) | Enforced | HTTPS-only, automatic certificate via Let's Encrypt |
| Backend (Render) | Enforced | HTTPS-only on the `onrender.com` domain |
| Supabase | Enforced | All connections to Supabase are HTTPS |

**CORS policy (production):**
```
CORS_ORIGINS=https://system4learn.com
```
The backend allows only the production frontend origin. `allow_methods=["*"]` and `allow_headers=["*"]` are permissive but scoped to the one allowed origin, so cross-origin requests from other domains are blocked.

**Local dev CORS:** `http://localhost:3000,http://localhost:5173` — overridden by the Render env var in production.

---

## 6. Dependency Audit Results

### Backend (`pip-audit`) — as of 2026-07-01

**Fixed in this release:**

| Package | From | To | CVE / Issue |
|---|---|---|---|
| python-jose | 3.3.0 | 3.4.0 | PYSEC-2024-232/233 — algorithm confusion attacks |
| python-multipart | 0.0.20 | 0.0.31 | CVE-2026-24486 et al. — form parsing DoS |
| python-dotenv | 1.0.1 | 1.2.2 | CVE-2026-28684 |

**Tracked / accepted:**

| Package | Issue | Mitigation |
|---|---|---|
| starlette 0.41.3 | PYSEC-2026-161/249/248, CVE-2025-54121, CVE-2025-62727, CVE-2026-48817/48818 — various DoS via headers/multipart | Render applies request size limits; upgrade trigger: next `fastapi` major bump |

### Frontend (`npm audit`) — as of 2026-07-01

**Fixed in this release:** 3 DOMPurify vulns resolved via `npm audit fix`.

**Tracked / accepted:**

| Package | Severity | Issue | Mitigation |
|---|---|---|---|
| DOMPurify (transitive) | Moderate | Various `IN_PLACE` and predicate-bypass XSS vectors | EduVeda does **not** call DOMPurify directly. No `IN_PLACE`, `ADD_TAGS`, or `USE_PROFILES` usage. Rendering is done via `react-markdown`. |
| launch-editor (via Vite devtools) | Critical | NTLMv2 hash disclosure via UNC path on Windows | **Dev-only** — not present in the production build bundle. Only reachable when running `vite` locally on Windows. |

**Upgrade path:** `npm audit fix --force` would force-upgrade `react-markdown` to a pre-release, breaking the markdown renderer. Defer until a stable `react-markdown` release resolves the transitive DOMPurify chain.

---

## 7. Data Privacy — Handling Minors

EduVeda's Student and External Student roles are routinely occupied by individuals under 18. The following safeguards apply:

### What data is stored
- **Students (institute):** name, email, mobile, date of birth, grade, class assignments, attendance records, fee profiles, quiz scores — all linked to an institute
- **External Students (standalone):** name, email, grade, subjects of interest, study history — self-registered
- **External Child Profiles (via External Parent):** name, grade, age, school, subjects — created and managed by the parent account

### What is NOT sent to AI models
- Student identities, emails, or contact details are never included in AI prompts
- AI calls pass only pedagogical context: topic, difficulty level, grade level (e.g. "Class 10"), or quiz subject
- Chat messages in the AI Help Chatbot and AI Tutor are sent verbatim to the Anthropic API — users should be advised not to include personal identifiers in chat

### Parental consent model
- External Child Profiles are created exclusively by the External Parent account holder
- The parent explicitly creates and manages all data for their child
- There is currently no formal age-gate at registration for External Student self-registration; add a date-of-birth field with a consent checkbox before public launch if required by applicable law (COPPA, DPDPA 2023)

### Minors-specific recommendations before public launch
1. Add a date-of-birth field to External Student registration with a minimum-age gate (e.g. 13+ for self-registration; parent account required below)
2. Add a data-retention/deletion endpoint — a parent or student should be able to request full account deletion
3. Add a privacy notice specific to minors to the onboarding flow
4. Review the AI chat transcript — if the platform stores chat history, apply a shorter retention period for minors' sessions

---

## 8. Incident Response Contacts

| What broke | Who to contact |
|---|---|
| Supabase data breach or key exposure | Rotate keys at app.supabase.com → update Render env vars |
| Anthropic key misuse | Rotate at console.anthropic.com → update Render env var |
| Frontend defacement | Trigger redeploy from Netlify dashboard or `netlify deploy --prod --build` |
| Backend down | Check Render dashboard → Events tab for crash logs |
| Suspected JWT forgery | Rotate `SECRET_KEY` Render env var → all sessions invalidated |
