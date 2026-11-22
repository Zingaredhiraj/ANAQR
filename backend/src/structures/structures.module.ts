import { Module } from '@nestjs/common';
import { StructuresService } from './structures.service';
import { StructuresController } from './structures.controller';

@Module({
  providers: [StructuresService],
  controllers: [StructuresController],
  exports: [StructuresService],
})
export class StructuresModule {}
