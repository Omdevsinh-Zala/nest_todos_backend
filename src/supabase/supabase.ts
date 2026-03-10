import { createClient } from '@supabase/supabase-js';

export const SupabaseProvider = {
  provide: 'SUPABASE_CLIENT',
  useFactory: () =>
    createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!),
};
