import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueStatus } from '@prisma/client';

@Injectable()
export class ErrorReportsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId?: string) {
    return this.prisma.errorReport.create({
      data: {
        ...data,
        userId: userId || null,
        status: IssueStatus.OPEN,
      },
    });
  }

  async findAll(status?: IssueStatus, organId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status ? { status } : {}),
      ...(organId ? { organId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.errorReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organ: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.errorReport.count({ where }),
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

  async updateStatus(id: string, status: IssueStatus, resolution?: string, internalNote?: string) {
    return this.prisma.errorReport.update({
      where: { id },
      data: {
        status,
        resolution,
        internalNote,
        resolvedAt: status === IssueStatus.RESOLVED ? new Date() : undefined,
      },
    });
  }
}
