import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';
import { Roles } from '../common/decorators';
import { Role } from '@prisma/client';

@ApiTags('uploads')
@Controller({ path: 'uploads', version: '1' })
@Roles(Role.SUPER_ADMIN, Role.FACULTY)
@ApiBearerAuth()
export class UploadsController {
  constructor(private storage: StorageService) {}

  @Post('presigned')
  @ApiOperation({ summary: 'Get signed upload URL for direct S3 / R2 upload' })
  async getPresignedUrl(@Body() body: { filename: string; contentType: string; folder?: string }) {
    const folder = body.folder || 'models';
    const key = this.storage.generateKey(folder, body.filename);
    const uploadUrl = await this.storage.getSignedUploadUrl(key, body.contentType);

    return {
      message: 'Presigned upload URL generated',
      data: {
        key,
        uploadUrl,
      },
    };
  }
}
