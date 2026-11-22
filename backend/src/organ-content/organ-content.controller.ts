import { Controller, Get, Put, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganContentService } from './organ-content.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('organ-content')
@Controller({ path: 'organs/:organId/content', version: '1' })
export class OrganContentController {
  constructor(private service: OrganContentService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get organ content details' })
  async findByOrgan(@Param('organId') organId: string) {
    return { message: 'Organ content retrieved', data: await this.service.findByOrgan(organId) };
  }

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organ detailed content (Faculty / Admin)' })
  async updateContent(
    @Param('organId') organId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    const updated = await this.service.updateContent(organId, body, user?.id || 'admin');
    return { message: 'Organ content updated', data: updated };
  }
}
