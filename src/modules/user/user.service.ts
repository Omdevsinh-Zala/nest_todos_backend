import { Injectable } from '@nestjs/common';
import { UpdateUser } from '../../interfaces/user.interface';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class UserService {
  constructor(private readonly supabase: SupabaseService) {}

  USER_FIELDS =
    'id, email, first_name, last_name, login_provider, providers, avatar_url, is_verified, created_at, updated_at';

  // async getAllUsers() {
  //   const { data, error } = await this.supabase.from('users').select(this.USER_FIELDS);
  //   return data;
  // }

  async getUserData(token: string, id: string) {
    try {
      const { data, error } = await this.supabase
        .forUser(token)
        .from('users')
        .select(this.USER_FIELDS)
        .eq('id', id)
        .single();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(token: string, id: string) {
    try {
      const { data, error } = await this.supabase
        .forUser(token)
        .rpc('soft_delete_user', { id: id });
      return 'User deleted successfully';
    } catch (error) {
      throw error;
    }
  }

  async updateUser(token: string, id: string, user: UpdateUser) {
    try {
      const { data, error } = await this.supabase
        .forUser(token)
        .from('users')
        .update(user)
        .eq('id', id)
        .select(this.USER_FIELDS)
        .single();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
