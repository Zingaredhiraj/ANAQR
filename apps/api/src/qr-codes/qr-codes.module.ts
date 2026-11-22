import { Module } from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { QrCodesController } from './qr-codes.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [QrCodesService],
  controllers: [QrCodesController],
  exports: [QrCodesService],
})
export class QrCodesModule {}
