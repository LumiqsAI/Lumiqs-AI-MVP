import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from '../reports/report.schema';
import { PlanLimitsService } from './plan-limits.service';
import { PlanLimitGuard } from './plan-limit.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  providers: [PlanLimitsService, PlanLimitGuard],
  exports: [PlanLimitsService, PlanLimitGuard],
})
export class PlansModule {}
