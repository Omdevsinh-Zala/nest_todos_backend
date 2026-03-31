import { Injectable } from '@nestjs/common';
import { Todo } from '../../interfaces/todo.interface';
import { SupabaseService } from '../../supabase/supabase';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly supabase: SupabaseService) {}

  async getAllTodos(token: string, id: string) {
    const { data, error } = await this.supabase
      .forUser(token)
      .from('todos')
      .select(
        'id, title, description, status, priority, due_date, reminder_at, completed_at, position, bg_color, parent_id, todo_tags(tags(id, name, color))',
      )
      .eq('user_id', id)
      .order('position', { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  }

  async createTodo(token: string, user_id: string, todo: CreateTodoDto) {
    const { data, error } = await this.supabase
      .forUser(token)
      .from('todos')
      .insert({ ...todo, user_id: user_id, bg_color: this.bgColorGenerator() })
      .select('*')
      .single();

    if (error) {
      console.log(error);
      throw error;
    }
    return data;
  }

  async updateTodo(
    token: string,
    user_id: string,
    id: string,
    todo: UpdateTodoDto,
  ) {
    const todoData = { ...todo, user_id: user_id };

    if (todoData.status === 'completed' && todoData.completed_at) {
      throw new Error('Completed tasks cannot be edited.');
    }

    if (todo.status === 'completed' && !todo.completed_at) {
      todoData.completed_at = new Date().toISOString();
    }

    if (todo.status !== 'completed' && todo.completed_at) {
      todoData.completed_at = undefined;
    }

    const { data, error } = await this.supabase
      .forUser(token)
      .from('todos')
      .update(todoData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Deletes a todo item
   * @param token string
   * @param id string
   * @returns string
   */
  async deleteTodo(token: string, id: string) {
    const { data, error } = await this.supabase
      .forUser(token)
      .rpc('soft_delete_todo', { todo_id: id });

    if (error) {
      console.log(error);
      throw error;
    }

    return 'Todo deleted successfully';
  }

  // Tags

  async addTag(token: string, tag_id: string, todo_id: string) {
    const { data, error } = await this.supabase
      .forUser(token)
      .from('todo_tags')
      .insert({ tag_id: tag_id, todo_id: todo_id })
      .select('*')
      .single();

    if (error) {
      console.log(error);
      throw error;
    }
    return data;
  }

  async removeTag(token: string, todo_id: string, tag_id: string) {
    const { data, error } = await this.supabase
      .forUser(token)
      .rpc('soft_delete_todo_tag', { p_todo_id: todo_id, p_tag_id: tag_id });

    if (error) {
      console.log(error);
      throw error;
    }
    return 'Tag removed successfully';
  }

  /**
   * Generates a random background color in rgba format
   * @returns string
   */
  bgColorGenerator() {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 100) / 100})`;
  }
}
