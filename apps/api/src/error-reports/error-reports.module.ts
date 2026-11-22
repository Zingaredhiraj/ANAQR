import { Module } from '@nestjs/common';
import { ErrorReportsService } from './error-reports.service';
import { ErrorReportsController } from './error-reports.controller';

@Module({
  providers: [ErrorReportsService],
  controllers: [ErrorReportsController],
  exports: [ErrorReportsService],
})
export class ErrorReportsModule {}
