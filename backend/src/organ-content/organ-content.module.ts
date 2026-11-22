import { Module } from '@nestjs/common';
import { OrganContentService } from './organ-content.service';
import { OrganContentController } from './organ-content.controller';

@Module({
  providers: [OrganContentService],
  controllers: [OrganContentController],
  exports: [OrganContentService],
})
export class OrganContentModule {}
