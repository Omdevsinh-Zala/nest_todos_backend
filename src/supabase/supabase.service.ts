import { Injectable, Inject } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_OPTIONS } from './supabase.constant';
import type { SupabaseModuleOptions } from './supabase.constant';

@Injectable()
export class SupabaseService {
  private anonClient: SupabaseClient;

  constructor(
    @Inject(SUPABASE_OPTIONS) private options: SupabaseModuleOptions,
  ) {
    this.anonClient = createClient(options.supabaseUrl, options.supabaseKey);
  }

  // For unauthenticated operations (register, verify email, login)
  getAnon(): SupabaseClient {
    return this.anonClient;
  }

  // For authenticated operations (update, todos, tags etc.)
  // Creates a lightweight scoped client reusing the same config
  forUser(accessToken: string): SupabaseClient {
    return createClient(this.options.supabaseUrl, this.options.supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        persistSession: false, // ← important, don't cache user sessions
      },
    });
  }
}
