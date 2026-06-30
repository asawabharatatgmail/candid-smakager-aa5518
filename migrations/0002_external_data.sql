-- ============================================================
-- Migration 0002: External role's own data layer
--
-- Completes the vertical started in 0001 (auth) — children profiles,
-- personal AI config, AI-generated study content, activity tracking,
-- progress reports, and the student subscription/plan catalog.
--
-- IMPORTANT — polymorphic ownership, no hard FKs by design:
-- personal_ai_configs.owner_id, saved_ai_content.owner_id,
-- activity_sessions.student_id, and ai_progress_reports.student_id are
-- shared across institute Students (students.id) AND External Students
-- (external_students.id) — sometimes also institute Parents
-- (parents.id) / External Parents (external_parents.id) for the AI
-- config table. A single FK can't reference two different tables, so
-- these columns are plain UUID with an index, integrity enforced at
-- the application layer. If this becomes a real correctness problem,
-- the fix is a discriminator column (owner_kind) + a CHECK, not a FK.
--
-- SECURITY NOTE: personal_ai_configs stores user-supplied third-party
-- AI provider API keys (their own Gemini/OpenAI/etc. keys) in plain
-- TEXT columns. This matches today's localStorage-only storage (not a
-- regression) but should move to encrypted-at-rest storage before
-- this table holds real user data at scale — flagged for the
-- Phase 5 security report, not blocking this migration.
--
-- Run after 0001_external_roles.sql.
-- ============================================================

-- ============================================================
-- EXTERNAL CHILD PROFILES (manually-added children under an External Parent)
-- ============================================================
CREATE TABLE external_child_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES external_parents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    age INT NOT NULL,
    subjects_of_interest TEXT[] DEFAULT '{}',
    school_name TEXT,
    city TEXT,
    linked_external_student_id UUID REFERENCES external_students(id) ON DELETE SET NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERSONAL AI CONFIG (per-user AI provider keys — Student or Parent, any account type)
-- ============================================================
CREATE TABLE personal_ai_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    owner_role TEXT NOT NULL CHECK (owner_role IN ('Student', 'Parent')),
    active_provider TEXT NOT NULL DEFAULT 'gemini'
        CHECK (active_provider IN ('gemini', 'openai', 'anthropic', 'groq', 'custom')),
    gemini_api_key TEXT,
    openai_api_key TEXT,
    anthropic_api_key TEXT,
    groq_api_key TEXT,
    custom_api_key TEXT,
    custom_api_url TEXT,
    custom_model_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (owner_id)
);

-- ============================================================
-- SAVED AI CONTENT (quizzes / flashcards / study material / summaries)
-- ============================================================
CREATE TABLE saved_ai_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'flashcards', 'study_material', 'summary')),
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_shared_with_parent BOOLEAN NOT NULL DEFAULT FALSE,
    ai_provider TEXT NOT NULL DEFAULT 'gemini',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY SESSIONS (study time tracking)
-- ============================================================
CREATE TABLE activity_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    date DATE NOT NULL,
    duration_minutes INT NOT NULL,
    activity TEXT NOT NULL CHECK (activity IN ('quiz', 'flashcards', 'study_material', 'video', 'game', 'notes', 'ai_generate')),
    subject_id UUID,
    content_title TEXT,
    score INT,
    total_questions INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI PROGRESS REPORTS
-- ============================================================
CREATE TABLE ai_progress_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    period_label TEXT NOT NULL,
    summary TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    areas_to_improve TEXT[] DEFAULT '{}',
    study_recommendations TEXT[] DEFAULT '{}',
    weekly_time_spent JSONB DEFAULT '[]',
    subject_scores JSONB DEFAULT '[]',
    overall_score INT NOT NULL,
    attendance_percent INT NOT NULL
);

-- ============================================================
-- STUDENT PLANS (catalog — admin-managed, External Student subscriptions)
-- ============================================================
CREATE TABLE student_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    features TEXT[] DEFAULT '{}',
    challenges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    share_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ai_generator_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    max_ai_generations INT NOT NULL DEFAULT 5,
    detailed_reports_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    leaderboard_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES external_students(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES student_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'trial', 'cancelled')),
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('UPI', 'Card', 'NetBanking', 'Free Trial')),
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — enabled, no policies (service-role-only access)
-- ============================================================
ALTER TABLE external_child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_ai_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_external_child_profiles_parent ON external_child_profiles(parent_id);
CREATE INDEX idx_personal_ai_configs_owner ON personal_ai_configs(owner_id);
CREATE INDEX idx_saved_ai_content_owner ON saved_ai_content(owner_id);
CREATE INDEX idx_activity_sessions_student ON activity_sessions(student_id);
CREATE INDEX idx_activity_sessions_date ON activity_sessions(date);
CREATE INDEX idx_ai_progress_reports_student ON ai_progress_reports(student_id);
CREATE INDEX idx_student_subscriptions_student ON student_subscriptions(student_id);

-- ============================================================
-- updated_at TRIGGERS
-- ============================================================
CREATE TRIGGER update_external_child_profiles_updated_at
    BEFORE UPDATE ON external_child_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_ai_configs_updated_at
    BEFORE UPDATE ON personal_ai_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_subscriptions_updated_at
    BEFORE UPDATE ON student_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA — default student plans (mirrors test/data/seedData.ts
-- SEED_STUDENT_PLANS so demo accounts have something to subscribe to)
-- ============================================================
INSERT INTO student_plans (name, price, billing_cycle, features, challenges_enabled, share_enabled, ai_generator_enabled, max_ai_generations, detailed_reports_enabled, leaderboard_enabled, is_active) VALUES
('Free Explorer', 0, 'monthly', ARRAY['5 AI generations/month', 'Basic quizzes & flashcards', 'Personal library'], FALSE, FALSE, TRUE, 5, FALSE, FALSE, TRUE),
('Learner', 49, 'monthly', ARRAY['30 AI generations/month', 'All content types', 'Share up to 5 materials', 'Basic progress report'], FALSE, TRUE, TRUE, 30, TRUE, FALSE, TRUE),
('Pro Scholar', 99, 'monthly', ARRAY['Unlimited AI generations', 'Create & join challenges', 'Public library sharing', 'Detailed AI progress report', 'Leaderboard access', 'Challenge invites'], TRUE, TRUE, TRUE, -1, TRUE, TRUE, TRUE),
('Elite Champion', 149, 'monthly', ARRAY['Everything in Pro', 'Unlimited challenges', 'Featured on public leaderboard', 'Custom branding on challenges', 'Priority AI responses', 'Analytics dashboard'], TRUE, TRUE, TRUE, -1, TRUE, TRUE, TRUE);
