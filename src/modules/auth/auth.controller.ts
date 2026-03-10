import { Controller, Post, Get, Res, Query, Body } from '@nestjs/common';
import type { Response } from 'express';
import { Auth } from './auth';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: Auth) {}

  @Post('/register')
  async register(@Body() body: RegisterDto) {
    // ValidationPipe automatically ensures `body` matches `RegisterDto` requirements.
    return this.authService.register(body);
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    // ValidationPipe automatically ensures `body` matches `LoginDto` requirements.
    return this.authService.login(body);
  }

  @Post('/logout')
  async logout() {}

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
