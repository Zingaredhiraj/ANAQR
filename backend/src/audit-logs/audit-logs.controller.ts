import { Controller, Get, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('audit-logs')
@Controller({ path: 'audit-logs', version: '1' })
@Roles(Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private service: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get institutional audit logs (Admin only)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
  ) {
    const result = await this.service.findAll(Number(page) || 1, Number(limit) || 50, entity, userId);
    return { message: 'Audit logs retrieved', ...result };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all institutional audit logs (Admin only)' })
  async clearAll() {
    const result = await this.service.clearAll();
    return { message: 'Audit logs cleared successfully', count: result.count };
  }
}
