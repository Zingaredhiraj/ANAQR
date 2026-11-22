import { Module } from '@nestjs/common';
import { LearningModulesService } from './learning-modules.service';
import { LearningModulesController } from './learning-modules.controller';

@Module({
  providers: [LearningModulesService],
  controllers: [LearningModulesController],
  exports: [LearningModulesService],
})
export class LearningModulesModule {}
