import { Controller, Get, Post, Patch, Param, Query, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ErrorReportsService } from './error-reports.service';
import { Public, Roles } from '../common/decorators';
import { Role, IssueStatus } from '@prisma/client';
import { Request } from 'express';

@ApiTags('error-reports')
@Controller({ path: 'error-reports', version: '1' })
export class ErrorReportsController {
  constructor(private service: ErrorReportsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit an error / issue report for an organ' })
  async create(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    const report = await this.service.create(body, user?.id);
    return { message: 'Report submitted successfully', data: report };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List error reports (Admin / Faculty)' })
  async findAll(
    @Query('status') status?: IssueStatus,
    @Query('organId') organId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.service.findAll(status, organId, Number(page) || 1, Number(limit) || 20);
    return { message: 'Error reports retrieved', ...result };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report status (Resolve / In Progress / Reject)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: IssueStatus; resolution?: string; internalNote?: string },
  ) {
    const updated = await this.service.updateStatus(id, body.status, body.resolution, body.internalNote);
    return { message: 'Report status updated', data: updated };
  }
}
