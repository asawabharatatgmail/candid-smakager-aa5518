-- ============================================================
-- Migration 0001: External Parent & External Student roles
--
-- These roles are standalone (not linked to any institute) and were
-- built client-side only, storing plaintext passwords in localStorage.
-- This migration adds real, hashed-password-backed tables for them,
-- following the exact conventions used by users/students/teachers/parents
-- in supabase_schema.sql (UUID PK, password_hash, RLS enabled with no
-- policies — service-role-only access via the backend).
--
-- Run after supabase_schema.sql has been applied.
-- ============================================================

-- ============================================================
-- EXTERNAL PARENTS
-- ============================================================
CREATE TABLE external_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    city TEXT,
    password_hash TEXT NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    plan_id TEXT,
    subscription_status TEXT NOT NULL DEFAULT 'none'
        CHECK (subscription_status IN ('none', 'trial', 'active', 'expired')),
    subscription_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXTERNAL STUDENTS
-- ============================================================
CREATE TABLE external_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    password_hash TEXT NOT NULL,
    grade TEXT NOT NULL,
    age INT NOT NULL,
    subjects_of_interest TEXT[] DEFAULT '{}',
    school_name TEXT,
    city TEXT,
    status user_status NOT NULL DEFAULT 'active',
    linked_parent_id UUID REFERENCES external_parents(id) ON DELETE SET NULL,
    plan_id TEXT,
    subscription_status TEXT NOT NULL DEFAULT 'none'
        CHECK (subscription_status IN ('none', 'trial', 'active', 'expired')),
    subscription_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — enabled, no policies (deny-all to anon key,
-- service-role key used by the backend bypasses RLS), matching the
-- posture already used for users/students/teachers in the base schema.
-- ============================================================
ALTER TABLE external_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_students ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_external_parents_email ON external_parents(email);
CREATE INDEX idx_external_students_email ON external_students(email);
CREATE INDEX idx_external_students_parent ON external_students(linked_parent_id);

-- ============================================================
-- updated_at TRIGGERS (reuses update_updated_at_column() from supabase_schema.sql)
-- ============================================================
CREATE TRIGGER update_external_parents_updated_at
    BEFORE UPDATE ON external_parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_students_updated_at
    BEFORE UPDATE ON external_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
