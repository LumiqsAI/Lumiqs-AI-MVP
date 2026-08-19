import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { Business, BusinessSchema } from './business.schema';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessOwnerGuard],
  exports: [BusinessesService],
})
export class BusinessesModule {}
