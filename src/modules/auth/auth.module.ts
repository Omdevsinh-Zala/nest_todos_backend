import fs from 'fs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './auth';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../../supabase/supabase.module';
import { MailService } from './mail.service';
import { TokenCleanupService } from './token-cleanup.service';
import { SupabaseService } from '../../supabase/supabase';

@Module({
  imports: [
    SupabaseModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => ({
        privateKey:
          process.env.NODE_ENV === 'production'
            ? process.env.PRIVATE_KEY?.replace(/\\n/g, '\n')
            : fs.readFileSync(process.env.PRIVATE_KEY_PATH || ''), // sign with private key
        publicKey:
          process.env.NODE_ENV === 'production'
            ? process.env.PUBLIC_KEY?.replace(/\\n/g, '\n')
            : fs.readFileSync(process.env.PUBLIC_KEY_PATH || ''), // verify with public key
        signOptions: {
          algorithm: 'RS256',
          keyid: process.env.JWT_KEY_ID?.toString(),
        },
      }),
    }),
  ],
  providers: [Auth, MailService, TokenCleanupService, SupabaseService],
  controllers: [AuthController],
})
export class AuthModule {}
