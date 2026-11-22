import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            anatomicalSystems: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            designation: true,
            specialization: true,
          },
        },
        anatomicalSystems: true,
      },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(data: { name: string; code?: string; description?: string }) {
    return this.prisma.department.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; code: string; description: string; isActive: boolean }>) {
    return this.prisma.department.update({ where: { id }, data });
  }
}
