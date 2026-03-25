import { Injectable } from '@nestjs/common';
import { Todo } from './todo.interface';
import { SupabaseService } from 'src/supabase/supabase';

@Injectable()
export class TodoService {
  constructor(
    private readonly supabase: SupabaseService,
  ) {}

  async createTodo(todo: Todo) {
    // const { data, error } = await this.supabase.from('todos').insert(todo);
    // if (error) {
    //   throw error;
    // }
    // return data;
  }
}
