-- ======================================================
-- MIGRATION 002 — TAGS, TODOS, TODO_TAGS
-- Merged: create_tags + create_todos + create_todo_tags
-- ======================================================


-- ======================================================
-- ENUM TYPES
-- ======================================================

CREATE TYPE todo_status   AS ENUM ('backlog', 'in_progress', 'completed', 'cancelled');
CREATE TYPE todo_priority AS ENUM ('none', 'low', 'medium', 'high', 'urgent');


-- ======================================================
-- TAGS TABLE
-- ======================================================

CREATE TABLE public.tags (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  color      TEXT,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  deleted_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT unique_tag_name_per_user UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id    ON public.tags (user_id);
CREATE INDEX idx_tags_name       ON public.tags (name);
CREATE INDEX idx_tags_deleted_at ON public.tags (deleted_at);

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON public.tags FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON public.tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING (auth.uid() = user_id);


-- ======================================================
-- TODOS TABLE
-- ======================================================

CREATE TABLE public.todos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  description TEXT,
  status      todo_status   NOT NULL DEFAULT 'backlog',
  priority    todo_priority NOT NULL DEFAULT 'none',
  due_date    TIMESTAMP WITH TIME ZONE,
  reminder_at TIMESTAMP WITH TIME ZONE,
  position    INTEGER NOT NULL DEFAULT 0,
  parent_id   UUID REFERENCES public.todos(id) ON DELETE CASCADE,
  bg_color    TEXT,
  deleted_at  TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT reminder_requires_due_date CHECK (
    reminder_at IS NULL OR due_date IS NOT NULL
  ),
  CONSTRAINT completed_at_requires_status CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);

-- ---- View ----

CREATE VIEW public.todos_view AS
  SELECT
    t.*,
    (
      t.due_date IS NOT NULL
      AND t.due_date < now()
      AND t.status NOT IN ('completed', 'cancelled')
      AND t.deleted_at IS NULL
    ) AS is_overdue,
    (t.parent_id IS NOT NULL) AS is_subtask
  FROM public.todos t;

-- ---- Indexes ----

CREATE INDEX idx_todos_user_id    ON public.todos (user_id);
CREATE INDEX idx_todos_status     ON public.todos (status);
CREATE INDEX idx_todos_priority   ON public.todos (priority);
CREATE INDEX idx_todos_due_date   ON public.todos (due_date);
CREATE INDEX idx_todos_parent_id  ON public.todos (parent_id);
CREATE INDEX idx_todos_deleted_at ON public.todos (deleted_at);
CREATE INDEX idx_todos_created_at ON public.todos (created_at);

-- ---- Triggers ----

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

CREATE OR REPLACE FUNCTION auto_set_todo_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1
      INTO NEW.position
      FROM public.todos
     WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_todo_position
  BEFORE INSERT ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_todo_position();

-- ---- RLS ----

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);


-- ======================================================
-- TODO_TAGS JUNCTION TABLE
-- ======================================================

CREATE TABLE public.todo_tags (
  todo_id    UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES public.tags(id)  ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (todo_id, tag_id)
);

CREATE INDEX idx_todo_tags_todo_id ON public.todo_tags (todo_id);
CREATE INDEX idx_todo_tags_tag_id  ON public.todo_tags (tag_id);

ALTER TABLE public.todo_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todo_tags"
  ON public.todo_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.todos
      WHERE todos.id = todo_tags.todo_id
        AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own todo_tags"
  ON public.todo_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.todos
      WHERE todos.id = todo_tags.todo_id
        AND todos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own todo_tags"
  ON public.todo_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.todos
      WHERE todos.id = todo_tags.todo_id
        AND todos.user_id = auth.uid()
    )
  );