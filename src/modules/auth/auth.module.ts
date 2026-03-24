import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './auth';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { MailService } from './mail.service';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    SupabaseModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  providers: [Auth, MailService, TokenCleanupService],
  controllers: [AuthController]
})
export class AuthModule {}
