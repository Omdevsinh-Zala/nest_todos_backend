import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { SupabaseService } from 'src/supabase/supabase';

@Module({
  controllers: [TagController],
  providers: [TagService, SupabaseService]
})
export class TagModule {}
