import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { BusinessDiscoveryService } from './business-discovery.service';
import { Business, BusinessSchema } from './business.schema';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]),
    PlansModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessDiscoveryService, BusinessOwnerGuard],
  exports: [BusinessesService],
})
export class BusinessesModule {}
