import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrgansService } from './organs.service';
import { OrgansController } from './organs.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrgansController],
  providers: [OrgansService],
  exports: [OrgansService],
})
export class OrgansModule {}
