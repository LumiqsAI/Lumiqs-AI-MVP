import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompetitorsController } from './competitors.controller';
import { CompetitorsService } from './competitors.service';
import { AIModule } from '../ai/ai.module';
import { PlansModule } from '../plans/plans.module';
import { Report, ReportSchema } from '../reports/report.schema';
import { Competitor, CompetitorSchema } from './competitor.schema';

@Module({
  imports: [
    AIModule,
    PlansModule,
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Competitor.name, schema: CompetitorSchema },
    ]),
  ],
  controllers: [CompetitorsController],
  providers: [CompetitorsService],
})
export class CompetitorsModule {}
