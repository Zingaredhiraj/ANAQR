import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId?: string) {
    return this.prisma.feedback.create({
      data: {
        ...data,
        userId: userId || null,
        isAnonymous: !userId,
      },
    });
  }

  async findAll(organId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = organId ? { organId } : {};

    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organ: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async delete(id: string) {
    return this.prisma.feedback.delete({ where: { id } });
  }
}
