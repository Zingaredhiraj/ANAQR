import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ContentStatus, IssueStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalOrgans,
      publishedOrgans,
      draftOrgans,
      totalFaculty,
      totalStudents,
      totalQrCodes,
      totalScans,
      totalModels,
      totalQuizAttempts,
      feedbacks,
      pendingApprovals,
      unresolvedReports,
    ] = await Promise.all([
      this.prisma.organ.count(),
      this.prisma.organ.count({ where: { isPublished: true } }),
      this.prisma.organ.count({ where: { status: ContentStatus.DRAFT } }),
      this.prisma.user.count({ where: { role: Role.FACULTY } }),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.qRCode.count({ where: { isActive: true } }),
      this.prisma.scanEvent.count(),
      this.prisma.threeDModel.count({ where: { isPublished: true } }),
      this.prisma.quizAttempt.count(),
      this.prisma.feedback.aggregate({ _avg: { overallRating: true } }),
      this.prisma.organ.count({ where: { status: ContentStatus.PENDING_REVIEW } }),
      this.prisma.errorReport.count({
        where: { status: { in: [IssueStatus.OPEN, IssueStatus.IN_PROGRESS] } },
      }),
    ]);

    return {
      totalOrgans,
      publishedOrgans,
      draftOrgans,
      totalFaculty,
      totalStudents,
      totalQrCodes,
      totalScans,
      totalModels,
      totalQuizAttempts,
      avgFeedbackRating: Number(feedbacks._avg.overallRating?.toFixed(1)) || 0,
      pendingApprovals,
      unresolvedReports,
    };
  }

  /**
   * Uses a raw SQL date_trunc GROUP BY instead of loading all rows into Node.js
   * memory, which is critical once scan_events grows large.
   */
  async getScansOverTime(days = 30) {
    const cappedDays = Math.min(Math.max(Number(days) || 30, 1), 365);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - cappedDays);

    // Build a continuous date series in JS and merge DB counts
    const counts = await this.prisma.$queryRaw<
      Array<{ day: Date; count: bigint }>
    >`
      SELECT
        date_trunc('day', created_at) AS day,
        COUNT(*)::bigint AS count
      FROM scan_events
      WHERE created_at >= ${fromDate}
      GROUP BY day
      ORDER BY day ASC
    `;

    // Build an index for O(1) lookup
    const countMap = new Map<string, number>();
    for (const row of counts) {
      const key = new Date(row.day).toISOString().split('T')[0];
      countMap.set(key, Number(row.count));
    }

    // Fill in every day in the range (including days with zero scans)
    const result: Array<{ date: string; count: number }> = [];
    for (let i = 0; i <= cappedDays; i++) {
      const d = new Date(fromDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, count: countMap.get(key) ?? 0 });
    }

    return result;
  }

  async getOrganScanDistribution(limit = 10) {
    const cappedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const organs = await this.prisma.organ.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { scanEvents: true } },
      },
      orderBy: { scanEvents: { _count: 'desc' } },
      take: cappedLimit,
    });

    return organs.map((o) => ({
      organ: o.name,
      scans: o._count.scanEvents,
    }));
  }

  async getFeedbackStats() {
    const ratings = await this.prisma.feedback.groupBy({
      by: ['overallRating'],
      _count: { overallRating: true },
    });

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      dist[r.overallRating] = r._count.overallRating;
    }

    return Object.entries(dist).map(([rating, count]) => ({
      rating: Number(rating),
      count,
    }));
  }

  async getQuizPerformanceSummary() {
    const result = await this.prisma.quizAttempt.aggregate({
      _avg: { percentage: true },
      _count: { id: true },
    });
    const passedCount = await this.prisma.quizAttempt.count({ where: { passed: true } });

    return {
      totalAttempts: result._count.id,
      avgScore: Number((result._avg.percentage ?? 0).toFixed(1)),
      passRate:
        result._count.id > 0
          ? Number(((passedCount / result._count.id) * 100).toFixed(1))
          : 0,
    };
  }
}
