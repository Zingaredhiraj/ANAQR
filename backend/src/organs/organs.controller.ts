import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { ContentStatus, Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrgansService } from './organs.service';
import { CreateOrganDto, UpdateOrganDto, OrgansQueryDto } from './dto/organs.dto';
import { Public, Roles, CurrentUser } from '../common/decorators';

export class UpdateOrganStatusDto {
  @ApiProperty({ enum: ContentStatus, description: 'Target review status' })
  @IsEnum(ContentStatus)
  @IsNotEmpty()
  status: ContentStatus;

  @ApiProperty({ required: false, description: 'Review notes, rejection reason or feedback' })
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiTags('organs')
@Controller({ path: 'organs', version: '1' })
export class OrgansController {
  constructor(private readonly organsService: OrgansService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all organs with pagination, search, and filters' })
  async findAll(@Query() query: OrgansQueryDto) {
    return this.organsService.findAll(query);
  }

  @Public()
  @Get('system/:systemSlug')
  @ApiOperation({ summary: 'Get published organs for an anatomical system' })
  async getBySystem(@Param('systemSlug') systemSlug: string) {
    return this.organsService.getBySystem(systemSlug);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get full organ details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.organsService.findBySlug(slug);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new organ draft' })
  async create(
    @Body() dto: CreateOrganDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organsService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organ details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organsService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organ review and publication status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrganStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organsService.updateStatus(id, body.status, userId, body.note);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an organ' })
  async delete(@Param('id') id: string) {
    await this.organsService.delete(id);
  }
}
