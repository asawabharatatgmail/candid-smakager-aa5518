-- Migration 0003: freemium trial support + password reset tokens
-- Run after 0001 and 0002.

-- ── 1. Add 'trial' to the institute subscription_status enum ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'trial'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')
  ) THEN
    ALTER TYPE subscription_status ADD VALUE 'trial';
  END IF;
END $$;

-- ── 2. Ensure institutes has a TIMESTAMPTZ expiry (not just DATE) ─────────────
-- Safe no-op if it already exists.
ALTER TABLE institutes
  ADD COLUMN IF NOT EXISTS subscription_expiry_ts TIMESTAMPTZ;

-- ── 3. Password reset tokens ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT        NOT NULL,
    token       TEXT        NOT NULL UNIQUE,
    account_type TEXT       NOT NULL CHECK (account_type IN ('institute','external_parent','external_student')),
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_prt_email ON password_reset_tokens(email);

-- Auto-delete stale tokens after 24 h (keep table clean via RLS/cron alternative)
-- No native pg_cron on free Supabase; instead we purge on lookup in the API layer.

-- ── 4. Row Level Security (service role bypasses this) ────────────────────────
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- Only the backend service role can read/write this table.
CREATE POLICY "service role only" ON password_reset_tokens
  USING (false) WITH CHECK (false);
