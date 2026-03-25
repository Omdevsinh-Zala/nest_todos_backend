// supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private anonClient: SupabaseClient;

  constructor() {
    this.anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  // For unauthenticated operations (register, verify email, login)
  getAnon(): SupabaseClient {
    return this.anonClient;
  }

  // For authenticated operations (update, todos, tags etc.)
  // Creates a lightweight scoped client reusing the same config
  forUser(accessToken: string): SupabaseClient {
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
        auth: {
          persistSession: false,  // ← important, don't cache user sessions
        },
      }
    );
  }
}