import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('departments')
@Controller({ path: 'departments', version: '1' })
export class DepartmentsController {
  constructor(private service: DepartmentsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all departments' })
  async findAll() {
    return { message: 'Departments retrieved', data: await this.service.findAll() };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get department details by ID' })
  async findById(@Param('id') id: string) {
    return { message: 'Department retrieved', data: await this.service.findById(id) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create department (Admin only)' })
  async create(@Body() body: { name: string; code?: string; description?: string }) {
    return { message: 'Department created', data: await this.service.create(body) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update department (Admin only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return { message: 'Department updated', data: await this.service.update(id, body) };
  }
}
