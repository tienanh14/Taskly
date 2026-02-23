-- ============================================================
-- Taskly Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- ENUMS
CREATE TYPE task_type AS ENUM ('CONTENT', 'MEDIA', 'RESOURCE', 'REMINDER');
CREATE TYPE task_status AS ENUM ('assigned', 'processing', 'done', 'expired');
CREATE TYPE task_mode AS ENUM ('block', 'deadline');

-- SPACES
CREATE TABLE spaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color_dot  TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROJECTS
CREATE TABLE projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id         UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  drive_folder_id  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TASKS
CREATE TABLE tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  type             task_type NOT NULL DEFAULT 'REMINDER',
  status           task_status NOT NULL DEFAULT 'assigned',
  mode             task_mode NOT NULL DEFAULT 'deadline',
  priority         SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  reference_link   TEXT,
  drive_link       TEXT,
  duration_minutes INTEGER,
  due_at           TIMESTAMPTZ,
  started_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX tasks_project_id_idx ON tasks(project_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_due_at_idx ON tasks(due_at);

-- ROW LEVEL SECURITY (enable as needed)
ALTER TABLE spaces  ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks   ENABLE ROW LEVEL SECURITY;

-- Allow all for now (replace with auth policies when ready)
CREATE POLICY "allow all" ON spaces  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON tasks   FOR ALL USING (true) WITH CHECK (true);
