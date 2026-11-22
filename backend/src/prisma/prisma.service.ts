import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to PostgreSQL database');
    } catch (error: any) {
      this.logger.error(`❌ Database connection failed: ${error.message}`);
      if (process.env.DATABASE_URL?.includes('xxxxxx')) {
        this.logger.error(
          '⚠️ CRITICAL: Your DATABASE_URL contains the placeholder "dpg-xxxxxx-a"! Please replace it with your real Render database URL.',
        );
      }
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
