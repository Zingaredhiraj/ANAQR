import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'auto');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY', '');

    this.bucket = this.configService.get<string>('S3_BUCKET', 'anatoscan-storage');
    this.publicUrl = this.configService
      .get<string>('S3_PUBLIC_URL', 'http://localhost:9000/anatoscan-storage')
      .replace(/\/+$/, '');

    this.s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  generateKey(folder: string, filename: string): string {
    const sanitizedFilename = filename
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_');
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    return `${cleanFolder}/${uuidv4()}-${sanitizedFilename}`;
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);
      return `${this.publicUrl}/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3 at key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file at key ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3 at key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed upload URL for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed download URL for key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
