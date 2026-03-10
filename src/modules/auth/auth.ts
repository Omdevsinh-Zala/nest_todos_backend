import { Inject, Injectable } from '@nestjs/common';
import { Login, Register } from 'src/interfaces/auth.interface';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class Auth {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}
  async register(user: Register) {
    const { data, error } = await this.supabase.from('users').insert(user);
    if (error) {
      throw error;
    }
    return data;
  }

  async login(user: Login) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });
    if (error) {
      throw error;
    }
    return data;
  }

  async logout() {}

  async signUp() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.BACKEND_CALLBACK_URL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      throw error;
    }
    return data; // Contains data.url to redirect the user
  }

  async signIn() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.BACKEND_CALLBACK_URL,
      },
    });
    if (error) {
      throw error;
    }
    return data; // Contains data.url to redirect the user
  }

  async googleCallback(code: string) {
    const { data, error } =
      await this.supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return data; // Contains session and user
  }
}
