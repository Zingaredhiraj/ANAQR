import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage/storage.service';
import * as QRCodeLib from 'qrcode';

@Injectable()
export class QrCodesService {
  private readonly logger = new Logger(QrCodesService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private storage: StorageService,
  ) {}

  async generateForOrgan(organId: string, userId?: string) {
    const organ = await this.prisma.organ.findUnique({ where: { id: organId } });
    if (!organ) throw new NotFoundException('Organ not found');

    const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const targetUrl = `${appUrl}/o/${organ.slug}`;
    const code = `QR-${organ.slug.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Generate buffers
    const pngBuffer = await QRCodeLib.toBuffer(targetUrl, {
      type: 'png',
      errorCorrectionLevel: 'Q',
      margin: 2,
      width: 512,
      color: { dark: '#10243A', light: '#FFFFFF' },
    });

    const svgString = await QRCodeLib.toString(targetUrl, {
      type: 'svg',
      errorCorrectionLevel: 'Q',
      margin: 2,
      color: { dark: '#10243A', light: '#FFFFFF' },
    });

    // Upload to object storage instead of storing data URLs in Postgres
    let pngUrl: string | undefined;
    let svgUrl: string | undefined;
    try {
      const pngKey = this.storage.generateKey('qr-codes', `${code}.png`);
      pngUrl = await this.storage.uploadFile(pngKey, pngBuffer, 'image/png', {
        organSlug: organ.slug,
      });

      const svgKey = this.storage.generateKey('qr-codes', `${code}.svg`);
      svgUrl = await this.storage.uploadFile(
        svgKey,
        Buffer.from(svgString, 'utf-8'),
        'image/svg+xml',
        { organSlug: organ.slug },
      );
    } catch (err) {
      // Storage upload failed — store inline data URL as fallback so QR is still usable
      this.logger.warn(
        `Storage upload failed for organ ${organ.slug}; falling back to data URL: ${err.message}`,
      );
      pngUrl = await QRCodeLib.toDataURL(targetUrl, {
        errorCorrectionLevel: 'Q',
        margin: 2,
        width: 512,
        color: { dark: '#10243A', light: '#FFFFFF' },
      });
      svgUrl = svgString;
    }

    return this.prisma.qRCode.create({
      data: {
        organId,
        code,
        url: targetUrl,
        pngUrl,
        svgUrl,
        errorLevel: 'Q',
        generatedById: userId,
      },
    });
  }

  async getForOrgan(organId: string) {
    return this.prisma.qRCode.findMany({
      where: { organId, isActive: true },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async generateBuffer(organId: string, format: 'png' | 'svg' = 'png'): Promise<Buffer> {
    const organ = await this.prisma.organ.findUnique({ where: { id: organId } });
    if (!organ) throw new NotFoundException('Organ not found');

    const qr = await this.prisma.qRCode.findFirst({
      where: { organId, isActive: true },
      orderBy: { generatedAt: 'desc' },
    });

    const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const targetUrl = qr?.url || `${appUrl}/o/${organ.slug}`;

    if (format === 'svg') {
      const svg = await QRCodeLib.toString(targetUrl, {
        type: 'svg',
        errorCorrectionLevel: 'Q',
        margin: 2,
        color: { dark: '#10243A', light: '#FFFFFF' },
      });
      return Buffer.from(svg, 'utf-8');
    }

    return QRCodeLib.toBuffer(targetUrl, {
      type: 'png',
      errorCorrectionLevel: 'Q',
      margin: 2,
      width: 1024,
      color: { dark: '#10243A', light: '#FFFFFF' },
    });
  }

  async bulkGenerate(organIds: string[], userId?: string) {
    const results = [];
    for (const organId of organIds) {
      try {
        results.push(await this.generateForOrgan(organId, userId));
      } catch (err) {
        this.logger.error(`Failed to generate QR for organ ${organId}: ${err.message}`);
        results.push({ organId, error: err.message });
      }
    }
    return results;
  }
}
