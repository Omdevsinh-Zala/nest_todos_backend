import { Module } from '@nestjs/common';
import { Auth } from './auth';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [Auth],
  controllers: [AuthController]
})
export class AuthModule {}
