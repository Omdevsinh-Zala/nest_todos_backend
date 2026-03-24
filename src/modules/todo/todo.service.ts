import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Todo } from './todo.interface';

@Injectable()
export class TodoService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async createTodo(todo: Todo) {
    const { data, error } = await this.supabase.from('todos').insert(todo);
    if (error) {
      throw error;
    }
    return data;
  }
}
