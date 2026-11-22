import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class AnatomySystemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.anatomicalSystem.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { organs: true } } },
    });
  }

  async findBySlug(slug: string) {
    const system = await this.prisma.anatomicalSystem.findUnique({
      where: { slug },
      include: {
        organs: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true, name: true, slug: true, scientificName: true,
            latinName: true, thumbnailUrl: true, description: true,
            status: true, isPublished: true,
          },
        },
        _count: { select: { organs: true } },
      },
    });
    if (!system) throw new NotFoundException(`Anatomical system '${slug}' not found`);
    return system;
  }

  async create(data: { name: string; description?: string; color?: string; orderIndex?: number }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.anatomicalSystem.create({
      data: { ...data, slug },
    });
  }

  async update(id: string, data: Partial<{ name: string; description: string; color: string; isActive: boolean }>) {
    const system = await this.prisma.anatomicalSystem.findUnique({ where: { id } });
    if (!system) throw new NotFoundException('Anatomical system not found');
    return this.prisma.anatomicalSystem.update({ where: { id }, data });
  }

  async delete(id: string) {
    const system = await this.prisma.anatomicalSystem.findUnique({ where: { id } });
    if (!system) throw new NotFoundException('Anatomical system not found');
    return this.prisma.anatomicalSystem.update({ where: { id }, data: { isActive: false } });
  }
}
