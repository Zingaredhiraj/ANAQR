import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LearningModulesService } from './learning-modules.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('learning-modules')
@Controller({ path: 'learning-modules', version: '1' })
export class LearningModulesController {
  constructor(private service: LearningModulesService) {}

  @Public()
  @Get('organ/:organId')
  @ApiOperation({ summary: 'Get all 3 modules for an organ' })
  async findByOrgan(@Param('organId') organId: string) {
    return { message: 'Learning modules retrieved', data: await this.service.findByOrgan(organId) };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get detailed learning module with sections' })
  async findById(@Param('id') id: string) {
    return { message: 'Learning module retrieved', data: await this.service.findById(id) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post('organ/:organId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create learning module for organ' })
  async create(@Param('organId') organId: string, @Body() body: any) {
    return { message: 'Learning module created', data: await this.service.create(organId, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update learning module' })
  async update(@Param('id') id: string, @Body() body: any) {
    return { message: 'Learning module updated', data: await this.service.update(id, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post(':id/sections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add section to learning module' })
  async addSection(@Param('id') moduleId: string, @Body() body: any) {
    return { message: 'Section added', data: await this.service.addSection(moduleId, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Patch('sections/:sectionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update section' })
  async updateSection(@Param('sectionId') sectionId: string, @Body() body: any) {
    return { message: 'Section updated', data: await this.service.updateSection(sectionId, body) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Delete('sections/:sectionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove section' })
  async deleteSection(@Param('sectionId') sectionId: string) {
    return { message: 'Section removed', data: await this.service.deleteSection(sectionId) };
  }
}
