import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModelStatus } from '@prisma/client';

@Injectable()
export class ModelsService {
  constructor(private prisma: PrismaService) {}

  async findByOrgan(organId: string, publicOnly = true) {
    return this.prisma.threeDModel.findMany({
      where: {
        organId,
        ...(publicOnly ? { isPublished: true, status: ModelStatus.READY } : {}),
      },
      include: {
        hotspots: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
        layers: { orderBy: { orderIndex: 'asc' } },
        animations: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  async findById(id: string) {
    const model = await this.prisma.threeDModel.findUnique({
      where: { id },
      include: {
        hotspots: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
        layers: { orderBy: { orderIndex: 'asc' } },
        animations: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
        organ: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!model) throw new NotFoundException('3D Model not found');
    return model;
  }

  async create(organId: string, data: any, userId: string) {
    return this.prisma.threeDModel.create({
      data: {
        ...data,
        organId,
        uploadedById: userId,
        status: ModelStatus.READY,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.threeDModel.update({
      where: { id },
      data,
    });
  }

  async setPrimary(id: string) {
    const model = await this.findById(id);
    await this.prisma.threeDModel.updateMany({
      where: { organId: model.organId },
      data: { isPrimary: false },
    });
    return this.prisma.threeDModel.update({
      where: { id },
      data: { isPrimary: true },
    });
  }

  async delete(id: string) {
    return this.prisma.threeDModel.update({
      where: { id },
      data: { status: ModelStatus.ARCHIVED, isPublished: false },
    });
  }

  async addHotspot(modelId: string, data: any) {
    return this.prisma.modelHotspot.create({
      data: { ...data, modelId },
    });
  }

  async removeHotspot(hotspotId: string) {
    return this.prisma.modelHotspot.update({
      where: { id: hotspotId },
      data: { isActive: false },
    });
  }
}
