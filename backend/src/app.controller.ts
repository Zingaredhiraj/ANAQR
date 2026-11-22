import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root health check for Render load balancers' })
  root() {
    return {
      status: 'ok',
      service: 'anatoscan-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  health() {
    return {
      status: 'ok',
      service: 'anatoscan-api',
      timestamp: new Date().toISOString(),
    };
  }
}
