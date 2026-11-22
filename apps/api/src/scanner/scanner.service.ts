import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, randomUUID } from 'crypto';

/** Matches /o/<slug> and /organs/<slug> patterns from any origin */
const ORGAN_SLUG_RE = /(?:\/o\/|\/organs\/)([a-z0-9][a-z0-9-]{0,99})/i;

@Injectable()
export class ScannerService {
  constructor(private prisma: PrismaService) {}

  async processScan(
    url: string,
    sessionId: string,
    deviceCategory?: string,
    browserCategory?: string,
    referrer?: string,
    ip?: string,
  ) {
    // Validate URL is an actual HTTP(S) URL before regex matching
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      throw new BadRequestException('Invalid URL format for QR scan');
    }

    const match = parsedUrl.pathname.match(ORGAN_SLUG_RE);
    if (!match) {
      throw new BadRequestException('URL does not point to a known organ path (/o/<slug>)');
    }
    const slug = match[1].toLowerCase();

    const organ = await this.prisma.organ.findUnique({
      where: { slug },
      include: {
        system: true,
        models: { where: { isPrimary: true, isPublished: true } },
      },
    });

    if (!organ) {
      throw new NotFoundException(`Organ '${slug}' not found`);
    }

    // Hash IP with a salt for privacy (DPDP / GDPR) — not reversible
    const ipSalt = process.env['IP_HASH_SALT'] ?? 'anatoscan-ip-salt';
    const ipHash = ip
      ? createHash('sha256')
          .update(ip + ipSalt)
          .digest('hex')
          .substring(0, 16)
      : undefined;

    await this.prisma.scanEvent.create({
      data: {
        organId: organ.id,
        sessionId: sessionId || randomUUID(),
        deviceCategory: deviceCategory || 'unknown',
        browserCategory: browserCategory || 'unknown',
        referrer: referrer || null,
        ipHash: ipHash || null,
      },
    });

    return { slug: organ.slug, organ };
  }
}
