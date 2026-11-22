import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContentStatus,
  Organ,
  AnatomicalSystem,
  OrganContent,
  AnatomicalStructure,
  Disorder,
  LearningModule,
  ThreeDModel,
  QRCode,
  Quiz,
} from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateOrganDto {
  @ApiProperty({ description: 'Common name of the organ', example: 'Heart' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Scientific name', example: 'Cor' })
  @IsOptional()
  @IsString()
  scientificName?: string;

  @ApiPropertyOptional({ description: 'Latin name', example: 'Cor' })
  @IsOptional()
  @IsString()
  latinName?: string;

  @ApiProperty({ description: 'UUID of the anatomical system' })
  @IsUUID()
  @IsNotEmpty()
  systemId: string;

  @ApiPropertyOptional({ description: 'High-level description of the organ' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Anatomical location within the human body', example: 'Mediastinum' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Tags associated with the organ', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateOrganDto extends PartialType(CreateOrganDto) {
  @ApiPropertyOptional({ description: 'URL of thumbnail image' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'URL of cover banner image' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}

export class OrgansQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by anatomical system ID' })
  @IsOptional()
  @IsUUID()
  systemId?: string;

  @ApiPropertyOptional({ enum: ContentStatus, description: 'Filter by content status' })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Filter by published flag' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isPublished?: boolean;
}

export interface OrganSummary {
  id: string;
  name: string;
  slug: string;
  scientificName: string | null;
  latinName: string | null;
  thumbnailUrl: string | null;
  status: ContentStatus;
  isPublished: boolean;
  system: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface OrganDetail extends Organ {
  system: AnatomicalSystem;
  content: OrganContent | null;
  structures: AnatomicalStructure[];
  disorders: Disorder[];
  learningModules: (LearningModule & {
    sections?: any[];
  })[];
  models: ThreeDModel[];
  qrCodes: QRCode[];
  quizzes: Quiz[];
}
