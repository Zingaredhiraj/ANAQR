import { Module } from '@nestjs/common';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressController } from './learning-progress.controller';

@Module({
  providers: [LearningProgressService],
  controllers: [LearningProgressController],
  exports: [LearningProgressService],
})
export class LearningProgressModule {}
