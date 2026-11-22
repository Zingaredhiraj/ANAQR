import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { ScannerService } from './scanner.service';
import { Public } from '../common/decorators';

class ScanDto {
  @IsUrl({ require_tld: false }, { message: 'url must be a valid HTTP/HTTPS URL' })
  url: string;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  sessionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(16)
  deviceCategory?: string;
}

@ApiTags('scanner')
@Controller({ path: 'scanner', version: '1' })
export class ScannerController {
  constructor(private service: ScannerService) {}

  @Public()
  @Post('scan')
  @ApiOperation({ summary: 'Validate QR destination and record anonymous scan analytics' })
  async scan(@Body() body: ScanDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress;

    let deviceCategory = body.deviceCategory;
    if (!deviceCategory) {
      deviceCategory = /mobile/i.test(userAgent)
        ? 'mobile'
        : /tablet|ipad/i.test(userAgent)
        ? 'tablet'
        : 'desktop';
    }

    const browserCategory = /chrome/i.test(userAgent)
      ? 'Chrome'
      : /safari/i.test(userAgent)
      ? 'Safari'
      : /firefox/i.test(userAgent)
      ? 'Firefox'
      : 'Other';

    const result = await this.service.processScan(
      body.url,
      body.sessionId || randomUUID(),
      deviceCategory,
      browserCategory,
      referrer as string,
      ip,
    );

    return { message: 'Scan processed successfully', data: result };
  }
}
