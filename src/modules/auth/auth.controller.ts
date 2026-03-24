import { Controller, Post, Get, Res, Query, Body, Req, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Auth } from './auth';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: Auth) {}

  @Post('/register')
  async register(@Body() body: RegisterDto, @Req() req: Request) {
    delete body.confirm_password;
    // Extract IP address from request
    const ip_address = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    
    const userData = await this.authService.register({ ...body, ip_address });
    return userData;
  }

  @Get('/verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmailToken(token);
  }

  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token, refresh_token } = await this.authService.login(body);
    
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    return user;
  }

  @Post('/refresh')
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Attempt to extract the refresh token (checks properly for cookies if configured)
    const cookieHeader = req.headers.cookie;
    let refresh_token: string | undefined;

    if (req.cookies && req.cookies['refresh_token']) {
      refresh_token = req.cookies['refresh_token'];
    } else if (cookieHeader) {
      const parsedCookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      refresh_token = parsedCookies['refresh_token'];
    }

    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshToken(refresh_token);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return { message: 'Tokens refreshed successfully' };
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const access_token = req.cookies?.['access_token'];
    
    // Call the service with the active token if additional tracking is needed
    if (access_token) {
      await this.authService.logout(access_token);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @Get('/signup/google')
  async signUp(@Res() res: Response) {
    const data = await this.authService.signUp();
    return res.redirect(data.url);
  }

  @Get('/signin/google')
  async signIn(@Res() res: Response) {
    const data = await this.authService.signIn();
    return res.redirect(data.url);
  }

  @Get('/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    if (code) {
      const data = await this.authService.googleCallback(code);
      res.cookie('access_token', data.session.access_token, { httpOnly: true });
      return res.redirect(`${process.env.FRONTEND_REDIRECTION_URL}`);
    }

    return res.redirect(
      `${process.env.FRONTEND_BASE_URL}/login?error=InvalidAuth`,
    );
  }
}
