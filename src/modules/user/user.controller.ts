import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { User } from 'src/interfaces/user.interface';

@Controller('/api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get('me')
  // getMe(@Req() req: Request) {
  //   // The user object here contains the Google profile and email,
  //   // attached by the AuthGuard after verifying the token with Supabase.
  //   return (req as any).user;
  // }

  // @Get()
  // getAll() {
  //   return this.userService.getAllUsers();
  // }

  @Get('')
  getOne(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req['user'] as any;
    return this.userService.getUserData(user.token, user.sub);
  }

  @Patch('')
  updateUser(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'] as any;
    return this.userService.updateUser(user.token, user.sub, body);
  }

  @Delete('')
  deleteUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'] as any;
    return this.userService.deleteUser(user.token, user.sub);
  }
}
