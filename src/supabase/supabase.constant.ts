export const SUPABASE_OPTIONS = 'SUPABASE_OPTIONS';

export interface SupabaseModuleOptions {
  supabaseUrl: string;
  supabaseKey: string;
}

export interface SupabaseModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<SupabaseModuleOptions> | SupabaseModuleOptions;
}