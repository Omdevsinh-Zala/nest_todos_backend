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
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import type { UpdateUser } from 'src/interfaces/user.interface';

@Controller('/api/v1/users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get('me')
  // getMe(@Req() req: Request) {
  //   // The user object here contains the Google profile and email,
  //   // attached by the AuthGuard after verifying the token with Supabase.
  //   return (req as any).user;
  // }

  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  createUser(@Body() user: any) {
    return this.userService.createUser(user);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() user: UpdateUser) {
    return this.userService.updateUser(id, user);
  }
}
