import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TodoService } from './todo.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';

@Controller('/api/v1/todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  //   Todo Routes
  @Get()
  async getAllTodos(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    return this.todoService.getAllTodos(user.token, user.sub);
  }

  @Post()
  async createTodo(
    @Req() req: Request,
    @Body() body: CreateTodoDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    return this.todoService.createTodo(user.token, user.sub, body);
  }

  @Put(':id')
  async updateTodo(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateTodoDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    return this.todoService.updateTodo(user.token, user.sub, id, body);
  }

  @Delete(':id')
  async deleteTodo(
    @Req() req: Request,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    return this.todoService.deleteTodo(user.token, id);
  }

  //   Tag Routes

  @Post(':id/tag')
  async addTag(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { tag_id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    return this.todoService.addTag(user.token, body.tag_id, id);
  }

  @Delete(':id/tag/:tag_id')
  async removeTag(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('tag_id') tag_id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    return this.todoService.removeTag(user.token, id, tag_id);
  }
}
