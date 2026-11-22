import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('quizzes')
@Controller({ path: 'quizzes', version: '1' })
export class QuizzesController {
  constructor(private service: QuizzesService) {}

  @Public()
  @Get('organ/:organId')
  @ApiOperation({ summary: 'List published quizzes for an organ' })
  async findByOrgan(@Param('organId') organId: string) {
    return { message: 'Quizzes retrieved', data: await this.service.findByOrgan(organId) };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get quiz questions (without answers revealed)' })
  async findById(@Param('id') id: string) {
    return { message: 'Quiz retrieved', data: await this.service.findById(id) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post('organ/:organId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create quiz for organ (Faculty / Admin)' })
  async create(
    @Param('organId') organId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    const quiz = await this.service.create(organId, body, user?.id || 'admin');
    return { message: 'Quiz created', data: quiz };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post(':id/questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add question to quiz' })
  async addQuestion(@Param('id') quizId: string, @Body() body: any) {
    return { message: 'Question added', data: await this.service.addQuestion(quizId, body) };
  }

  @Post(':id/attempts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit quiz attempt and get real score and analysis' })
  async submitAttempt(
    @Param('id') quizId: string,
    @Body() body: { answers: Record<string, string>; timeTakenSec?: number },
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    const result = await this.service.submitAttempt(
      quizId,
      user?.id,
      body.answers,
      body.timeTakenSec,
    );
    return { message: 'Quiz attempt evaluated', data: result };
  }

  @Get('attempts/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student quiz history' })
  async getHistory(@Req() req: Request) {
    const user = req.user as { id: string };
    return { message: 'Quiz history retrieved', data: await this.service.getAttemptHistory(user?.id) };
  }
}
