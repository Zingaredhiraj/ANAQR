import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleType } from '@prisma/client';

@Injectable()
export class LearningModulesService {
  constructor(private prisma: PrismaService) {}

  async findByOrgan(organId: string) {
    return this.prisma.learningModule.findMany({
      where: { organId },
      orderBy: { orderIndex: 'asc' },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async findById(id: string) {
    const module = await this.prisma.learningModule.findUnique({
      where: { id },
      include: {
        organ: { select: { id: true, name: true, slug: true } },
        sections: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!module) throw new NotFoundException('Learning module not found');
    return module;
  }

  async create(organId: string, data: any) {
    return this.prisma.learningModule.create({
      data: { ...data, organId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.learningModule.update({
      where: { id },
      data,
    });
  }

  async addSection(moduleId: string, data: any) {
    return this.prisma.moduleSection.create({
      data: { ...data, moduleId },
    });
  }

  async updateSection(sectionId: string, data: any) {
    return this.prisma.moduleSection.update({
      where: { id: sectionId },
      data,
    });
  }

  async deleteSection(sectionId: string) {
    return this.prisma.moduleSection.update({
      where: { id: sectionId },
      data: { isActive: false },
    });
  }
}
