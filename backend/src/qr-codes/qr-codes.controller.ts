import { Controller, Get, Post, Param, Query, Res, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { QrCodesService } from './qr-codes.service';
import { Public, Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('qr-codes')
@Controller({ path: 'qr', version: '1' })
export class QrCodesController {
  constructor(private service: QrCodesService) {}

  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @Post('generate/:organId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate QR code for an organ' })
  async generate(@Param('organId') organId: string, @Req() req: Request) {
    const user = req.user as { id: string };
    const qr = await this.service.generateForOrgan(organId, user?.id);
    return { message: 'QR Code generated', data: qr };
  }

  @Public()
  @Get(':organId')
  @ApiOperation({ summary: 'Get active QR codes for an organ' })
  async getForOrgan(@Param('organId') organId: string) {
    return { message: 'QR codes retrieved', data: await this.service.getForOrgan(organId) };
  }

  @Public()
  @Get(':organId/download')
  @ApiOperation({ summary: 'Download organ QR code as PNG or SVG' })
  async download(
    @Param('organId') organId: string,
    @Query('format') format: 'png' | 'svg' = 'png',
    @Res() res: Response,
  ) {
    const buffer = await this.service.generateBuffer(organId, format);
    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="qr-${organId}.${format}"`);
    res.send(buffer);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('bulk-generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk generate QR codes for organs (Admin only)' })
  async bulkGenerate(@Body() body: { organIds: string[] }, @Req() req: Request) {
    const user = req.user as { id: string };
    const results = await this.service.bulkGenerate(body.organIds, user?.id);
    return { message: 'Bulk QR generation completed', data: results };
  }
}
