import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: AuditAction,
    entity: string,
    entityId?: string,
    userId?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(page = 1, limit = 50, entity?: string, userId?: string) {
    const skip = (page - 1) * limit;
    const where = {
      ...(entity ? { entity } : {}),
      ...(userId ? { userId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
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

  async clearAll() {
    return this.prisma.auditLog.deleteMany({});
  }
}
