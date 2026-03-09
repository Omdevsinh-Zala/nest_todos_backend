-- ======================================================
-- ENUM TYPES
-- ======================================================

CREATE TYPE todo_status AS ENUM ('backlog', 'in_progress', 'completed', 'cancelled');
CREATE TYPE todo_priority AS ENUM ('none', 'low', 'medium', 'high', 'urgent');

-- ======================================================
-- TODOS TABLE
-- ======================================================

CREATE TABLE public.todos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Ownership
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Core fields
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  description   TEXT,

  -- Status & Priority
  status        todo_status   NOT NULL DEFAULT 'backlog',
  priority      todo_priority NOT NULL DEFAULT 'none',

  -- Scheduling
  due_date      TIMESTAMP WITH TIME ZONE,
  reminder_at   TIMESTAMP WITH TIME ZONE,

  -- Organisation
  tags          TEXT[]  DEFAULT '{}',
  position      INTEGER NOT NULL DEFAULT 0,          -- for manual drag-and-drop ordering

  -- Sub-tasks (self-referencing)
  parent_id     UUID REFERENCES public.todos(id) ON DELETE CASCADE,

  bg_color      TEXT,

  -- Soft delete
  deleted_at    TIMESTAMP WITH TIME ZONE DEFAULT NULL,

  -- Timestamps
  completed_at  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT reminder_requires_due_date CHECK (
    reminder_at IS NULL OR due_date IS NOT NULL
  ),
  CONSTRAINT completed_at_requires_status CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);

-- ======================================================
-- VIEW (with virtual fields)
-- ======================================================

CREATE VIEW public.todos_view AS
  SELECT
    t.*,
    -- Virtual: is this todo overdue?
    (
      t.due_date IS NOT NULL
      AND t.due_date < now()
      AND t.status NOT IN ('completed', 'cancelled')
      AND t.deleted_at IS NULL
    ) AS is_overdue,
    -- Virtual: is this a subtask?
    (t.parent_id IS NOT NULL) AS is_subtask
  FROM public.todos t;

-- ======================================================
-- INDEXES
-- ======================================================

CREATE INDEX idx_todos_user_id         ON public.todos (user_id);
CREATE INDEX idx_todos_status          ON public.todos (status);
CREATE INDEX idx_todos_priority        ON public.todos (priority);
CREATE INDEX idx_todos_due_date        ON public.todos (due_date);
CREATE INDEX idx_todos_parent_id       ON public.todos (parent_id);
CREATE INDEX idx_todos_deleted_at      ON public.todos (deleted_at);
CREATE INDEX idx_todos_tags            ON public.todos USING GIN (tags);  -- fast tag filtering
CREATE INDEX idx_todos_created_at      ON public.todos (created_at);

-- ======================================================
-- TRIGGER — auto-update updated_at
-- ======================================================

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();  -- reuses function from users table

-- ======================================================
-- TRIGGER — auto-set completed_at when status changes
-- ======================================================

CREATE OR REPLACE FUNCTION handle_todo_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_todo_completed_at
  BEFORE UPDATE OF status ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION handle_todo_completion();

-- ======================================================
-- ROW LEVEL SECURITY
-- ======================================================

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos (excluding soft-deleted)
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can only insert todos for themselves
CREATE POLICY "Users can insert own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own todos
CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own todos
CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);