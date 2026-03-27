import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { TagService } from './tag.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('/api/v1/tags')
@UseGuards(JwtAuthGuard)
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    async getAllTags(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = req['user'];
        return this.tagService.getAllTags(user.token, user.sub);
    }

    @Post()
    async createTag(
        @Req() req: Request,
        @Body() body: CreateTagDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = req['user'];
        return this.tagService.createTag(user.token, user.sub, body);
    }

    @Patch(':id/toggle-pin')
    async togglePin(
        @Req() req: Request,
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = req['user'];
        return this.tagService.togglePin(user.token, user.sub, id);
    }

    @Post(':id')
    async updateTag(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: UpdateTagDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = req['user'];
        return this.tagService.updateTag(user.token, user.sub, id, body);
    }

    @Delete(':id')
    async deleteTag(
        @Req() req: Request,
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = req['user'];
        return this.tagService.deleteTag(user.token, user.sub, id);
    }
}
