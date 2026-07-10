-- ============================================================
-- CLEAR ALL USER DATA — run in Supabase SQL Editor
-- Deletes every row from every table but keeps the schema intact.
-- After running, re-seed the app_settings and student_plans rows.
-- ============================================================

-- Step 1: disable all FK checks for the session so order doesn't matter
SET session_replication_role = replica;

-- ── External role tables (from migrations 0001/0002/0003) ──────────────────
DELETE FROM student_subscriptions;
DELETE FROM ai_progress_reports;
DELETE FROM activity_sessions;
DELETE FROM saved_ai_content;
DELETE FROM personal_ai_configs;
DELETE FROM external_child_profiles;
DELETE FROM external_students;
DELETE FROM external_parents;
DELETE FROM password_reset_tokens;

-- ── Institute tables ────────────────────────────────────────────────────────
DELETE FROM fee_receipts;
DELETE FROM student_applied_discounts;
DELETE FROM student_installments;
DELETE FROM student_fee_profiles;
DELETE FROM fee_structure_installments;
DELETE FROM fee_structures;
DELETE FROM discounts;
DELETE FROM chat_messages;
DELETE FROM ai_chat_sessions;
DELETE FROM challenge_submissions;
DELETE FROM game_levels;
DELETE FROM game_challenges;
DELETE FROM notifications;
DELETE FROM social_posts;
DELETE FROM email_campaigns;
DELETE FROM google_ad_campaigns;
DELETE FROM schedule_events;
DELETE FROM attendance_records;
DELETE FROM notes;
DELETE FROM uploaded_documents;
DELETE FROM videos;
DELETE FROM study_materials;
DELETE FROM flashcards;
DELETE FROM flashcard_sets;
DELETE FROM quiz_submissions;
DELETE FROM quiz_questions;
DELETE FROM quizzes;
DELETE FROM email_templates;
DELETE FROM lead_reminders;
DELETE FROM leads;
DELETE FROM class_teachers;
DELETE FROM parents;
DELETE FROM teachers;
DELETE FROM students;
DELETE FROM academic_classes;
DELETE FROM subjects;
DELETE FROM users;
DELETE FROM branches;
DELETE FROM institutes;
DELETE FROM addons;
DELETE FROM subscription_packages;

-- Step 2: re-enable FK checks
SET session_replication_role = DEFAULT;

-- Step 3: restore the single app_settings row that the app expects
DELETE FROM app_settings;
INSERT INTO app_settings (multi_branch_enabled, is_ai_globally_enabled, is_maintenance_mode)
VALUES (FALSE, TRUE, FALSE);

-- Step 4: restore the student_plans catalog
-- (these are needed for External Student subscription features)
DELETE FROM student_plans;
INSERT INTO student_plans (name, price, billing_cycle, features, challenges_enabled, share_enabled, ai_generator_enabled, max_ai_generations, detailed_reports_enabled, leaderboard_enabled, is_active) VALUES
('Free Explorer',    0,   'monthly', ARRAY['5 AI generations/month', 'Basic quizzes & flashcards', 'Personal library'],
 FALSE, FALSE, TRUE, 5, FALSE, FALSE, TRUE),
('Learner',         49,   'monthly', ARRAY['30 AI generations/month', 'All content types', 'Share up to 5 materials', 'Basic progress report'],
 FALSE, TRUE, TRUE, 30, TRUE, FALSE, TRUE),
('Pro Scholar',     99,   'monthly', ARRAY['Unlimited AI generations', 'Create & join challenges', 'Public library sharing', 'Detailed AI progress report', 'Leaderboard access', 'Challenge invites'],
 TRUE, TRUE, TRUE, -1, TRUE, TRUE, TRUE),
('Elite Champion', 149,   'monthly', ARRAY['Everything in Pro', 'Unlimited challenges', 'Featured on public leaderboard', 'Custom branding on challenges', 'Priority AI responses', 'Analytics dashboard'],
 TRUE, TRUE, TRUE, -1, TRUE, TRUE, TRUE);

-- Done. Database is now blank and ready for fresh registrations.
