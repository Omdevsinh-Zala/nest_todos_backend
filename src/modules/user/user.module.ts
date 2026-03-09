import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  providers: [UserService, SupabaseModule],
  controllers: [UserController],
})
export class UserModule {}
