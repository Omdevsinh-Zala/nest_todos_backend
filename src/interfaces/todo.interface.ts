export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  reminder_at: string;
  position: number;
  parent_id: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  bg_color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoTag {
  todo_id: string;
  tag_id: string;
  created_at: string;
}
