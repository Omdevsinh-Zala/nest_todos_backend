import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
