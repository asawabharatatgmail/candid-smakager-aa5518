# Credential Rotation — Action Required

These credentials were found exposed in plaintext on disk (`eduveda-python/.env`, `test/.env`, and previously hardcoded in `run_schema.py`). They were **never committed to git** (the repo didn't exist until this rotation effort), but they should still be treated as compromised since they've sat unrotated on a local disk and may have been included in earlier zip exports. **Do these in order — I cannot do this myself, it requires your Supabase dashboard login.**

## 1. Rotate the Supabase DB password

Project: `lpoqediyncfjaeauruhb` (`https://lpoqediyncfjaeauruhb.supabase.co`)

1. Go to **Supabase Dashboard → Project Settings → Database**
2. Click **Reset Database Password**, copy the new password
3. You'll need it for the `SUPABASE_DB_URL` env var when running schema migrations (see below) — never paste it directly into a script again

## 2. Rotate the Supabase API keys

1. Go to **Project Settings → API**
2. Regenerate the **anon (public) key** and the **service role key**
3. Update:
   - `test/.env` → `VITE_SUPABASE_ANON_KEY`
   - `eduveda-python/.env` → `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`

> Note: the anon key is *meant* to be public-ish (it's embedded in the frontend bundle by design — Supabase's security model relies on Row Level Security policies, not secrecy of the anon key). The **service role key bypasses RLS entirely** — that one must never reach the frontend or any public repo.

## 3. Generate a new JWT signing secret

The current `SECRET_KEY` in `eduveda-python/.env` is a guessable, low-entropy string derived from the project name — not just exposed, but weak by construction. Replace it with a real random secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Update `eduveda-python/.env` → `SECRET_KEY`. This invalidates all existing login sessions (expected and fine — nobody has real production sessions yet).

## 4. Running schema migrations going forward

`run_schema.py` no longer hardcodes the DB password. Set it as an environment variable before running:

```bash
export SUPABASE_DB_URL="postgresql://postgres:<new-password>@db.lpoqediyncfjaeauruhb.supabase.co:5432/postgres"
python run_schema.py
```

(PowerShell: `$env:SUPABASE_DB_URL="postgresql://..."`)

## 5. After rotating

Delete this file once you've completed the steps above — it's a one-time runbook, not something that should linger in the repo referencing what the old (now-dead) credentials were.
