import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganContentService {
  constructor(private prisma: PrismaService) {}

  async findByOrgan(organId: string) {
    const content = await this.prisma.organContent.findUnique({
      where: { organId },
    });
    if (!content) throw new NotFoundException('Organ content not found');
    return content;
  }

  async updateContent(organId: string, data: any, userId: string) {
    const existing = await this.prisma.organContent.findUnique({
      where: { organId },
    });

    // Record revision history for changed fields
    if (existing) {
      for (const [key, val] of Object.entries(data)) {
        if (existing[key as keyof typeof existing] !== val && typeof val === 'string') {
          await this.prisma.contentRevision.create({
            data: {
              organId,
              fieldName: key,
              oldValue: String(existing[key as keyof typeof existing] ?? ''),
              newValue: String(val),
              changedById: userId,
            },
          });
        }
      }
    }

    return this.prisma.organContent.upsert({
      where: { organId },
      update: data,
      create: { ...data, organId },
    });
  }
}
