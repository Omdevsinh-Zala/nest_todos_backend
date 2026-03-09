import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('user')
export class UserController {

    @Get('users')
    findAll() {
        return 'This action returns all user';
    }

    @Get('user/:id')
    findOne() {
        return 'This action returns a #id user';
    }

    @Post('users/:id')
    createUser() {
        return 'This action creates a user';
    }

    @Delete('user/:id')
    removeUser() {
        return 'This action removes a #id user';
    }

    @Patch('user/:id')
    updateUser() {
        return 'This action updates a #id user';
    }
}
