import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningProgressService {
  constructor(private prisma: PrismaService) {}

  async recordActivity(
    userId: string,
    activityType: string,
    organId?: string,
    moduleId?: string,
    timeSpentSec?: number,
  ) {
    return this.prisma.learningActivity.create({
      data: {
        userId,
        organId,
        moduleId,
        activityType,
        timeSpentSec,
      },
    });
  }

  async getStudentProgress(userId: string) {
    const [activities, quizAttempts, bookmarks] = await Promise.all([
      this.prisma.learningActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          module: { select: { id: true, title: true, type: true } },
        },
      }),
      this.prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          quiz: { select: { id: true, title: true, organ: { select: { name: true } } } },
        },
      }),
      this.prisma.bookmark.findMany({
        where: { userId },
        include: {
          organ: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnailUrl: true,
              system: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const completedModulesCount = activities.filter((a) => a.activityType === 'complete_module').length;
    const averageQuizScore =
      quizAttempts.length > 0
        ? quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / quizAttempts.length
        : 0;

    return {
      activities,
      quizAttempts,
      bookmarks: bookmarks.map((b) => b.organ),
      completedModulesCount,
      averageQuizScore: Math.round(averageQuizScore),
    };
  }
}
