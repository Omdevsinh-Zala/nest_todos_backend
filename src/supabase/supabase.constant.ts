export const SUPABASE_OPTIONS = 'SUPABASE_OPTIONS';

export interface SupabaseModuleOptions {
  supabaseUrl: string;
  supabaseKey: string;
}

export interface SupabaseModuleAsyncOptions {
  imports?: unknown[];
  inject?: unknown[];
  useFactory: (
    ...args: unknown[]
  ) => Promise<SupabaseModuleOptions> | SupabaseModuleOptions;
}