import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisordersService {
  constructor(private prisma: PrismaService) {}

  async findByOrgan(organId: string) {
    return this.prisma.disorder.findMany({
      where: { organId, isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findById(id: string) {
    const disorder = await this.prisma.disorder.findUnique({ where: { id } });
    if (!disorder) throw new NotFoundException('Disorder not found');
    return disorder;
  }

  async create(organId: string, data: any) {
    return this.prisma.disorder.create({
      data: { ...data, organId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.disorder.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.disorder.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
