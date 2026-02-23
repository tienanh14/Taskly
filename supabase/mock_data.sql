-- ============================================================
-- Taskly Mock Data
-- Run this in your Supabase SQL editor AFTER running schema.sql
-- ============================================================

-- Clean up existing data to avoid duplicates if run multiple times
DELETE FROM tasks;
DELETE FROM projects;
DELETE FROM spaces;

-- ==========================================
-- 1. SPACES
-- ==========================================
INSERT INTO spaces (id, name, color_dot) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Work', '#3b83f7'),    -- Primary blue
  ('22222222-2222-2222-2222-222222222222', 'Personal', '#10b981'), -- Emerald green
  ('33333333-3333-3333-3333-333333333333', 'Side Hustle', '#f59e0b'); -- Amber

-- ==========================================
-- 2. PROJECTS
-- ==========================================
INSERT INTO projects (id, space_id, name) VALUES
  -- Projects for Work Space
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Q4 Marketing Campaign'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Website Redesign'),
  -- Projects for Personal Space
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Fitness Goals 2026'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'House Renovation'),
  -- Projects for Side Hustle Space
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Taskly App Launch');

-- ==========================================
-- 3. TASKS
-- ==========================================

-- Q4 Marketing Campaign (Work)
INSERT INTO tasks (project_id, title, type, status, mode, priority, due_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Write Launch Blog Post', 'CONTENT', 'assigned', 'deadline', 1, now() + interval '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Create Social Media Graphics', 'MEDIA', 'assigned', 'block', 2, now() + interval '3 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Review Marketing Budget', 'RESOURCE', 'processing', 'block', 1, now() + interval '1 day'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Send Newsletter', 'REMINDER', 'done', 'deadline', 2, now() - interval '1 day');

-- Website Redesign (Work)
INSERT INTO tasks (project_id, title, type, status, mode, priority, due_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Update Homepage Copy', 'CONTENT', 'assigned', 'block', 2, now() + interval '5 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Design Mobile Navigation', 'MEDIA', 'assigned', 'deadline', 1, now() + interval '4 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Cross-Browser Compatibility', 'REMINDER', 'assigned', 'block', 3, now() + interval '7 days');

-- Fitness Goals 2026 (Personal)
INSERT INTO tasks (project_id, title, type, status, mode, priority, due_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Research New Gym Routine', 'RESOURCE', 'done', 'block', 2, now() - interval '2 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Meal Prep for the Week', 'REMINDER', 'assigned', 'deadline', 1, now() + interval '10 hours');

-- Taskly App Launch (Side Hustle)
INSERT INTO tasks (project_id, title, type, status, mode, priority, due_at) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Draft Product Hunt Presentation', 'CONTENT', 'assigned', 'block', 1, now() + interval '1 day'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Record Demo Video', 'MEDIA', 'assigned', 'block', 1, now() + interval '2 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Review Competitor Analysis', 'RESOURCE', 'assigned', 'deadline', 3, now() + interval '5 days');

-- Add an overdue task to test Guard Modal
INSERT INTO tasks (project_id, title, type, status, mode, priority, due_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Urgent Client Email', 'REMINDER', 'processing', 'deadline', 1, now() - interval '1 hour');
