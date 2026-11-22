import { Module } from '@nestjs/common';
import { AnatomySystemsService } from './anatomy-systems.service';
import { AnatomySystemsController } from './anatomy-systems.controller';

@Module({
  providers: [AnatomySystemsService],
  controllers: [AnatomySystemsController],
  exports: [AnatomySystemsService],
})
export class AnatomySystemsModule {}
