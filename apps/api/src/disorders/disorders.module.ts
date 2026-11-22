import { Module } from '@nestjs/common';
import { DisordersService } from './disorders.service';
import { DisordersController } from './disorders.controller';

@Module({
  providers: [DisordersService],
  controllers: [DisordersController],
  exports: [DisordersService],
})
export class DisordersModule {}
