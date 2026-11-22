import { Controller, Get, Post, Delete, Param, Query, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('feedback')
@Controller({ path: 'feedback', version: '1' })
export class FeedbackController {
  constructor(private service: FeedbackService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit feedback for an organ (anonymous or authenticated)' })
  async create(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    const feedback = await this.service.create(body, user?.id);
    return { message: 'Feedback submitted successfully', data: feedback };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List feedback records (Admin / Faculty)' })
  async findAll(
    @Query('organId') organId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.service.findAll(organId, Number(page) || 1, Number(limit) || 20);
    return { message: 'Feedback retrieved', ...result };
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete feedback (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { message: 'Feedback deleted' };
  }
}
