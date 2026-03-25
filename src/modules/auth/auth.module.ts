import fs from 'fs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './auth';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { MailService } from './mail.service';
import { TokenCleanupService } from './token-cleanup.service';
import { SupabaseService } from 'src/supabase/supabase';

@Module({
  imports: [
    SupabaseModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        privateKey: fs.readFileSync(process.env.PRIVATE_KEY_PATH || ''), // sign with private key
        publicKey: fs.readFileSync(process.env.PUBLIC_KEY_PATH || ''), // verify with public key
        signOptions: {
          algorithm: 'RS256',
          keyid: (process.env.JWT_KEY_ID)?.toString(),
        },
      }),
    }),
  ],
  providers: [Auth, MailService, TokenCleanupService, SupabaseService],
  controllers: [AuthController],
})
export class AuthModule {}
