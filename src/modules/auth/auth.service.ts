import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Login, Register } from '../../interfaces/auth.interface';
import { AppError } from '../../common/errors/app.error';
import { MailService } from './mail.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class Auth {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) { }

  USER_PUBLIC_FIELDS =
    'id, email, first_name, last_name, login_provider, providers, avatar_url, is_verified, created_at, updated_at';

  async register(user: Register) {
    const hashedPassword = await this.hashPassword(user.password);
    const { data, error } = await this.supabase
      .getAnon()
      .from('users')
      .insert({
        ...user,
        password: hashedPassword,
        login_provider: 'email',
        providers: ['email'],
        is_verified: true,
      })
      .select(this.USER_PUBLIC_FIELDS)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError('Email already exists', HttpStatus.CONFLICT);
      }
      throw new AppError(error.message, HttpStatus.BAD_REQUEST);
    }

    // Generate Verification Token
    // const token = crypto.randomBytes(32).toString('hex');
    // const expiresAt = new Date();
    // expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes from now

    // Insert Token
    // const { error: tokenError } = await this.supabase
    //   .getAnon()
    //   .from('verification_tokens')
    //   .insert({
    //     user_id: (data as any).id,
    //     token: token,
    //     expires_at: expiresAt.toISOString(),
    //   });

    // if (tokenError) {
    //   throw new AppError(
    //     'Failed to generate verification token',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }

    // Send Verification Email
    // await this.mailService.sendVerificationEmail(user.email, token);

    return data;
  }

  async login(user: Login) {
    const { data, error } = await this.supabase
      .getAnon()
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error || !data) {
      throw new Error('Invalid credentials');
    }

    // Step 2 — check if email is verified
    if (!data.is_verified) {
      throw new Error('Please verify your email before logging in');
    }

    // Step 3 — compare password
    const isValid = await this.comparePassword(user.password, data.password);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Step 4 — return safe user object and generated JWT tokens
    const { password: _password, ip_address: _ip_address, ...safeUser } = data;

    // Generate JWT tokens
    const payload = { sub: safeUser.id, email: safeUser.email };
    const access_token = await this.jwtService.signAsync(
      { ...payload, role: 'authenticated' },
      {
        expiresIn: '1h',
      },
    );
    const refresh_token = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: '1d' },
    );

    return { user: safeUser, access_token, refresh_token };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const userPayload = { sub: payload.sub, email: payload.email };
      const access_token = await this.jwtService.signAsync(
        { ...userPayload, role: 'authenticated' },
        {
          expiresIn: '1h',
        },
      );
      const refresh_token = await this.jwtService.signAsync(
        { ...userPayload, type: 'refresh' },
        { expiresIn: '1d' },
      );

      return { access_token, refresh_token };
    } catch (e) {
      throw new AppError(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async verifyEmailToken(token: string) {
    // Check if token exists, is pending, and not expired
    const { data: verified, error } = await this.supabase
      .getAnon()
      .rpc('verify_email_token', { p_token: token });

    if (error) {
      throw new Error('Verification failed');
    }

    if (!verified) {
      // token not found, already used, or expired
      throw new Error('Invalid or expired verification token');
    }

    return { message: 'Email successfully verified' };
  }

  async signUp() {
    const { data, error } = await this.supabase.getAnon().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.BACKEND_CALLBACK_URL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      throw error;
    }
    return data; // Contains data.url to redirect the user
  }

  async signIn() {
    const { data, error } = await this.supabase.getAnon().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.BACKEND_CALLBACK_URL,
      },
    });
    if (error) {
      throw error;
    }
    return data; // Contains data.url to redirect the user
  }

  async googleCallback(code: string) {
    const { data, error } = await this.supabase
      .getAnon()
      .auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return data; // Contains session and user
  }

  async logout() {
    // Note: Since you're using statless JWTs, cookies handle the real frontend logout.
    // However, if the user signed in through Google OAuth, signing out from Supabase
    // ensures their backend session is properly killed as well!
    const { error } = await this.supabase.getAnon().auth.signOut();
    if (error) {
      console.error('Error during Supabase sign-out:', error.message);
    }
  }

  SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? process.env.BCRYPT_SALT_ROUNDS : '10';

  hashPassword = async (plain: string): Promise<string> => {
    return await bcrypt.hash(plain, Number(this.SALT_ROUNDS));
  };

  comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hashed);
  };
}
