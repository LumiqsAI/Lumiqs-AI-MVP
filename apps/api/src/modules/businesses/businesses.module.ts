import { Module } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessOwnerGuard],
  exports: [BusinessesService],
})
export class BusinessesModule {}
