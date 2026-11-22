import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LearningProgressService } from './learning-progress.service';
import { Request } from 'express';

@ApiTags('learning-progress')
@Controller({ path: 'learning-progress', version: '1' })
@ApiBearerAuth()
export class LearningProgressController {
  constructor(private service: LearningProgressService) {}

  @Post('activity')
  @ApiOperation({ summary: 'Record student learning action' })
  async recordActivity(
    @Body() body: { activityType: string; organId?: string; moduleId?: string; timeSpentSec?: number },
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    const activity = await this.service.recordActivity(
      user.id,
      body.activityType,
      body.organId,
      body.moduleId,
      body.timeSpentSec,
    );
    return { message: 'Activity recorded', data: activity };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current student dashboard learning stats' })
  async getStudentProgress(@Req() req: Request) {
    const user = req.user as { id: string };
    return { message: 'Student progress retrieved', data: await this.service.getStudentProgress(user.id) };
  }
}
