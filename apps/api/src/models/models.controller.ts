import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModelsService } from './models.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('models')
@Controller({ path: 'models', version: '1' })
export class ModelsController {
  constructor(private service: ModelsService) {}

  @Public()
  @Get('organ/:organId')
  @ApiOperation({ summary: 'Get published 3D models for an organ' })
  async findByOrgan(@Param('organId') organId: string) {
    return { message: '3D models retrieved', data: await this.service.findByOrgan(organId, true) };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get 3D model by ID' })
  async findById(@Param('id') id: string) {
    return { message: '3D model retrieved', data: await this.service.findById(id) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post('organ/:organId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register 3D model for organ (Faculty / Admin)' })
  async create(
    @Param('organId') organId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    const model = await this.service.create(organId, body, user?.id || 'admin');
    return { message: '3D model registered', data: model };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update 3D model metadata' })
  async update(@Param('id') id: string, @Body() body: any) {
    return { message: '3D model updated', data: await this.service.update(id, body) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/primary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set primary model for organ' })
  async setPrimary(@Param('id') id: string) {
    return { message: 'Primary model updated', data: await this.service.setPrimary(id) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post(':id/hotspots')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add hotspot to 3D model' })
  async addHotspot(@Param('id') modelId: string, @Body() body: any) {
    return { message: 'Hotspot added', data: await this.service.addHotspot(modelId, body) };
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive 3D model' })
  async delete(@Param('id') id: string) {
    return { message: '3D model archived', data: await this.service.delete(id) };
  }
}
