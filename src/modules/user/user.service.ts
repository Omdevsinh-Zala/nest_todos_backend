import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateUser } from 'src/interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}
  async getAllUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id);
    return data;
  }

  async deleteUser(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);
    return data;
  }

  async updateUser(id: string, user: UpdateUser) {
    const { data, error } = await this.supabase
      .from('users')
      .update(user)
      .eq('id', id);
    return data;
  }
}
