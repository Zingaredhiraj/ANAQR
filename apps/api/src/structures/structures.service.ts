import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StructuresService {
  constructor(private prisma: PrismaService) {}

  async findByOrgan(organId: string) {
    return this.prisma.anatomicalStructure.findMany({
      where: { organId, isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findById(id: string) {
    const structure = await this.prisma.anatomicalStructure.findUnique({
      where: { id },
    });
    if (!structure) throw new NotFoundException('Anatomical structure not found');
    return structure;
  }

  async create(organId: string, data: any) {
    return this.prisma.anatomicalStructure.create({
      data: { ...data, organId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.anatomicalStructure.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.anatomicalStructure.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
