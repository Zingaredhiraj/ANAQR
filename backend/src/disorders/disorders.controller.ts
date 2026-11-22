import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisordersService } from './disorders.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('disorders')
@Controller({ path: 'organs/:organId/disorders', version: '1' })
export class DisordersController {
  constructor(private service: DisordersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List disorders for an organ' })
  async findByOrgan(@Param('organId') organId: string) {
    return { message: 'Disorders retrieved', data: await this.service.findByOrgan(organId) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add disorder to organ' })
  async create(@Param('organId') organId: string, @Body() body: any) {
    return { message: 'Disorder added', data: await this.service.create(organId, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update disorder' })
  async update(@Param('id') id: string, @Body() body: any) {
    return { message: 'Disorder updated', data: await this.service.update(id, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove disorder' })
  async delete(@Param('id') id: string) {
    return { message: 'Disorder removed', data: await this.service.delete(id) };
  }
}
