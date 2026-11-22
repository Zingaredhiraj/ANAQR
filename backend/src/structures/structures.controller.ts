import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StructuresService } from './structures.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('structures')
@Controller({ path: 'organs/:organId/structures', version: '1' })
export class StructuresController {
  constructor(private service: StructuresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List structures for an organ' })
  async findByOrgan(@Param('organId') organId: string) {
    return { message: 'Structures retrieved', data: await this.service.findByOrgan(organId) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add anatomical structure to organ' })
  async create(@Param('organId') organId: string, @Body() body: any) {
    return { message: 'Structure added', data: await this.service.create(organId, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update anatomical structure' })
  async update(@Param('id') id: string, @Body() body: any) {
    return { message: 'Structure updated', data: await this.service.update(id, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove anatomical structure' })
  async delete(@Param('id') id: string) {
    return { message: 'Structure removed', data: await this.service.delete(id) };
  }
}
