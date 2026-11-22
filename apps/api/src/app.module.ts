import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { AnatomySystemsModule } from './anatomy-systems/anatomy-systems.module';
import { OrgansModule } from './organs/organs.module';
import { OrganContentModule } from './organ-content/organ-content.module';
import { StructuresModule } from './structures/structures.module';
import { DisordersModule } from './disorders/disorders.module';
import { LearningModulesModule } from './learning-modules/learning-modules.module';
import { ModelsModule } from './models/models.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { ScannerModule } from './scanner/scanner.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ErrorReportsModule } from './error-reports/error-reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { QueuesModule } from './queues/queues.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),

    // ── Rate limiting ────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    // ── Infrastructure ───────────────────────────────────────────────
    PrismaModule,
    RedisModule,
    StorageModule,
    QueuesModule,

    // ── Feature modules ──────────────────────────────────────────────
    AuthModule,
    UsersModule,
    DepartmentsModule,
    AnatomySystemsModule,
    OrgansModule,
    OrganContentModule,
    StructuresModule,
    DisordersModule,
    LearningModulesModule,
    ModelsModule,
    QrCodesModule,
    ScannerModule,
    QuizzesModule,
    FeedbackModule,
    ErrorReportsModule,
    AnalyticsModule,
    LearningProgressModule,
    BookmarksModule,
    UploadsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
