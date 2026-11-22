import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { Request } from 'express';

@ApiTags('bookmarks')
@Controller({ path: 'bookmarks', version: '1' })
@ApiBearerAuth()
export class BookmarksController {
  constructor(private service: BookmarksService) {}

  @Post(':organId/toggle')
  @ApiOperation({ summary: 'Bookmark / unbookmark an organ' })
  async toggle(@Param('organId') organId: string, @Req() req: Request) {
    const user = req.user as { id: string };
    const result = await this.service.toggle(user.id, organId);
    return { message: result.bookmarked ? 'Organ bookmarked' : 'Organ unbookmarked', data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get current user bookmarked organs' })
  async findByUser(@Req() req: Request) {
    const user = req.user as { id: string };
    return { message: 'Bookmarks retrieved', data: await this.service.findByUser(user.id) };
  }
}
