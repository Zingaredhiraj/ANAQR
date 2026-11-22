import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnatomySystemsService } from './anatomy-systems.service';
import { Public, Roles } from '../common/decorators';

@ApiTags('anatomy-systems')
@Controller({ path: 'anatomy-systems', version: '1' })
export class AnatomySystemsController {
  constructor(private service: AnatomySystemsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all anatomical systems' })
  async findAll() {
    return { message: 'Anatomical systems retrieved', data: await this.service.findAll() };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get anatomical system by slug with its organs' })
  async findBySlug(@Param('slug') slug: string) {
    return { message: 'Anatomical system retrieved', data: await this.service.findBySlug(slug) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new anatomical system (Admin only)' })
  async create(@Body() body: { name: string; description?: string; color?: string }) {
    return { message: 'Anatomical system created', data: await this.service.create(body) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update anatomical system (Admin only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return { message: 'Anatomical system updated', data: await this.service.update(id, body) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate anatomical system (Admin only)' })
  async delete(@Param('id') id: string) {
    return { message: 'Anatomical system deactivated', data: await this.service.delete(id) };
  }
}
