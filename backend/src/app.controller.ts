import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root health check' })
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

  @Get('api/health')
  @ApiOperation({ summary: 'API health check' })
  apiHealth() {
    return {
      status: 'ok',
      service: 'anatoscan-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/v1/health')
  @ApiOperation({ summary: 'API v1 health check (Render endpoint)' })
  apiV1Health() {
    return {
      status: 'ok',
      service: 'anatoscan-api',
      timestamp: new Date().toISOString(),
    };
  }
}
