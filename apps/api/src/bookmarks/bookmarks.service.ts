import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, organId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_organId: { userId, organId } },
    });

    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({
      data: { userId, organId },
    });
    return { bookmarked: true };
  }

  async findByUser(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        organ: {
          select: {
            id: true,
            name: true,
            slug: true,
            scientificName: true,
            thumbnailUrl: true,
            system: { select: { name: true, color: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookmarks.map((b) => b.organ);
  }
}
