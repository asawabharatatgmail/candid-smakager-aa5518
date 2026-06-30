-- ============================================================
-- EduVeda Smart Academic Administration & Analytics
-- Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('Product Owner', 'Class Admin', 'Branch Admin', 'Teacher', 'Student', 'Parent');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE lead_status AS ENUM ('New', 'Contacted', 'Qualified', 'Lost');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'inactive');
CREATE TYPE quiz_type AS ENUM ('Multiple Choice', 'True / False');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late');
CREATE TYPE fee_payment_mode AS ENUM ('Lumpsum', 'Installments');
CREATE TYPE installment_status AS ENUM ('Pending', 'Paid', 'Overdue', 'Partially Paid');
CREATE TYPE payment_mode AS ENUM ('Cash', 'Card', 'Online', 'Cheque');
CREATE TYPE campaign_status AS ENUM ('Active', 'Paused', 'Completed', 'Draft');
CREATE TYPE social_platform AS ENUM ('Facebook', 'Instagram', 'LinkedIn');
CREATE TYPE game_challenge_mode AS ENUM ('Time Attack', 'Deadline');
CREATE TYPE document_type AS ENUM ('pdf', 'docx', 'pptx', 'link');
CREATE TYPE payment_gateway_env AS ENUM ('Sandbox', 'Production');
CREATE TYPE discount_type AS ENUM ('Percentage', 'Fixed Amount');
CREATE TYPE feature_key AS ENUM ('AI_POWER_PACK', 'BUSINESS_SUITE');
CREATE TYPE event_type AS ENUM ('Lecture', 'Live Class');

-- ============================================================
-- SUBSCRIPTION PACKAGES & ADDONS
-- ============================================================
CREATE TABLE subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    features TEXT[] DEFAULT '{}',
    max_students INT NOT NULL DEFAULT 100,
    max_teachers INT NOT NULL DEFAULT 10,
    max_branch_admins INT NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    included_features TEXT[] DEFAULT '{}',
    feature_key feature_key NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSTITUTES
-- ============================================================
CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    admin_mobile TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    tagline TEXT,
    package_id UUID REFERENCES subscription_packages(id),
    active_addon_ids UUID[] DEFAULT '{}',
    subscription_status subscription_status NOT NULL DEFAULT 'inactive',
    subscription_expiry DATE,
    payment_gateway_enabled BOOLEAN DEFAULT FALSE,
    payment_gateway_provider TEXT DEFAULT 'PhonePe',
    payment_gateway_env payment_gateway_env DEFAULT 'Sandbox',
    payment_gateway_merchant_id TEXT,
    payment_gateway_salt_key TEXT,
    payment_gateway_salt_index TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APP SETTINGS (Global)
-- ============================================================
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    multi_branch_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_ai_globally_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO app_settings (multi_branch_enabled, is_ai_globally_enabled, is_maintenance_mode) VALUES (FALSE, TRUE, FALSE);

-- ============================================================
-- BRANCHES
-- ============================================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    head TEXT,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS (Admin/Staff accounts)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    password_hash TEXT NOT NULL,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    branch_ids UUID[] DEFAULT '{}',
    connected_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACADEMIC CLASSES
-- ============================================================
CREATE TABLE academic_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_teachers (
    class_id UUID REFERENCES academic_classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, teacher_id)
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    class_id UUID REFERENCES academic_classes(id),
    branch_ids UUID[] DEFAULT '{}',
    subject_ids UUID[] DEFAULT '{}',
    status user_status NOT NULL DEFAULT 'active',
    parent_name TEXT,
    parent_email TEXT,
    parent_mobile TEXT,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    connected_email TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    subject_ids UUID[] DEFAULT '{}',
    class_ids UUID[] DEFAULT '{}',
    branch_ids UUID[] DEFAULT '{}',
    status user_status NOT NULL DEFAULT 'active',
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    connected_email TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARENTS
-- ============================================================
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    connected_email TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEADS (CRM)
-- ============================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'Website',
    status lead_status NOT NULL DEFAULT 'New',
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    added_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    date_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status_target TEXT NOT NULL DEFAULT 'General',
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LMS: QUIZZES
-- ============================================================
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_title TEXT NOT NULL,
    quiz_type quiz_type NOT NULL DEFAULT 'Multiple Choice',
    topic TEXT NOT NULL,
    owner_id UUID NOT NULL,
    class_id UUID REFERENCES academic_classes(id),
    subject_id UUID REFERENCES subjects(id),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_answer_index INT NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    answers INT[] NOT NULL DEFAULT '{}',
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LMS: FLASHCARDS
-- ============================================================
CREATE TABLE flashcard_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    owner_id UUID NOT NULL,
    class_id UUID REFERENCES academic_classes(id),
    subject_id UUID REFERENCES subjects(id),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

-- ============================================================
-- LMS: STUDY MATERIALS
-- ============================================================
CREATE TABLE study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic TEXT NOT NULL,
    owner_id UUID NOT NULL,
    class_id UUID REFERENCES academic_classes(id),
    subject_id UUID REFERENCES subjects(id),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_by TEXT DEFAULT 'teacher',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LMS: VIDEOS
-- ============================================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    topic TEXT NOT NULL,
    owner_id UUID NOT NULL,
    class_id UUID REFERENCES academic_classes(id),
    subject_id UUID REFERENCES subjects(id),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LMS: UPLOADED DOCUMENTS
-- ============================================================
CREATE TABLE uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type document_type NOT NULL DEFAULT 'pdf',
    topic TEXT NOT NULL,
    owner_id UUID NOT NULL,
    class_id UUID REFERENCES academic_classes(id),
    subject_id UUID REFERENCES subjects(id),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENT NOTES
-- ============================================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'Present',
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    UNIQUE (student_id, subject_id, date)
);

-- ============================================================
-- SCHEDULE
-- ============================================================
CREATE TABLE schedule_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_id UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    event_type event_type DEFAULT 'Lecture',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEE MANAGEMENT
-- ============================================================
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    class_id UUID NOT NULL REFERENCES academic_classes(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    payment_mode fee_payment_mode NOT NULL DEFAULT 'Lumpsum',
    late_fee_per_day DECIMAL(8,2) NOT NULL DEFAULT 0,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fee_structure_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    due_date DATE NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type discount_type NOT NULL DEFAULT 'Percentage',
    value DECIMAL(10,2) NOT NULL,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_fee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    fee_structure_id UUID REFERENCES fee_structures(id),
    total_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_payable DECIMAL(12,2) NOT NULL DEFAULT 0,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, academic_year)
);

CREATE TABLE student_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_profile_id UUID NOT NULL REFERENCES student_fee_profiles(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    late_fee_applied DECIMAL(12,2) NOT NULL DEFAULT 0,
    status installment_status NOT NULL DEFAULT 'Pending',
    payment_date DATE,
    receipt_id UUID
);

CREATE TABLE student_applied_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_profile_id UUID NOT NULL REFERENCES student_fee_profiles(id) ON DELETE CASCADE,
    discount_id UUID NOT NULL REFERENCES discounts(id),
    name TEXT NOT NULL,
    applied_amount DECIMAL(12,2) NOT NULL
);

CREATE TABLE fee_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_mode payment_mode NOT NULL DEFAULT 'Cash',
    paid_for TEXT NOT NULL,
    breakdown JSONB DEFAULT '[]',
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DIGITAL MARKETING
-- ============================================================
CREATE TABLE google_ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status campaign_status NOT NULL DEFAULT 'Draft',
    budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    clicks INT NOT NULL DEFAULT 0,
    impressions INT NOT NULL DEFAULT 0,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    status campaign_status NOT NULL DEFAULT 'Draft',
    audience_size INT NOT NULL DEFAULT 0,
    sent_date DATE,
    open_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    click_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform social_platform NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    scheduled_date TIMESTAMPTZ NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    shares INT NOT NULL DEFAULT 0,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    link TEXT NOT NULL DEFAULT '#',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION
-- ============================================================
CREATE TABLE game_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    mode game_challenge_mode NOT NULL DEFAULT 'Time Attack',
    duration_minutes INT,
    deadline TIMESTAMPTZ,
    class_ids UUID[] DEFAULT '{}',
    owner_id UUID NOT NULL,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE game_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES game_challenges(id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE challenge_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES game_challenges(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score DECIMAL(8,2) NOT NULL DEFAULT 0,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNICATION (Chat)
-- ============================================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id TEXT NOT NULL,
    sender_id UUID NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI CHAT HISTORY (for context persistence)
-- ============================================================
CREATE TABLE ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'help',
    messages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_branches_institute ON branches(institute_id);
CREATE INDEX idx_users_institute ON users(institute_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_institute ON students(institute_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_teachers_institute ON teachers(institute_id);
CREATE INDEX idx_leads_institute ON leads(institute_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_quizzes_institute ON quizzes(institute_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_schedule_institute ON schedule_events(institute_id);
CREATE INDEX idx_fee_profiles_student ON student_fee_profiles(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_chat_conversation ON chat_messages(conversation_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_institutes_updated_at BEFORE UPDATE ON institutes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_fee_profiles_updated_at BEFORE UPDATE ON student_fee_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_chat_sessions_updated_at BEFORE UPDATE ON ai_chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
