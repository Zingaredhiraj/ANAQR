import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('analytics')
@Controller({ path: 'admin/analytics', version: '1' })
@Roles(Role.SUPER_ADMIN, Role.FACULTY)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Platform summary statistics' })
  async getOverview() {
    return { message: 'Analytics overview retrieved', data: await this.service.getOverview() };
  }

  @Get('scans')
  @ApiOperation({ summary: 'QR scan events over time (DB-aggregated, not in-memory)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '1–365, default 30' })
  async getScans(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return {
      message: 'Scans over time retrieved',
      data: await this.service.getScansOverTime(days),
    };
  }

  @Get('organs')
  @ApiOperation({ summary: 'Organ scan distribution' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '1–50, default 10' })
  async getOrgans(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return {
      message: 'Organ scan distribution retrieved',
      data: await this.service.getOrganScanDistribution(limit),
    };
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Feedback rating distribution' })
  async getFeedback() {
    return { message: 'Feedback distribution retrieved', data: await this.service.getFeedbackStats() };
  }

  @Get('quiz-performance')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Quiz pass rate and average score (Admin only)' })
  async getQuizPerformance() {
    return {
      message: 'Quiz performance summary retrieved',
      data: await this.service.getQuizPerformanceSummary(),
    };
  }
}
