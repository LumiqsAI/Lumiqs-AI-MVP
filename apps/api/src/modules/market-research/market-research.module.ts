import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketResearchController } from './market-research.controller';
import { MarketResearchService } from './market-research.service';
import { AIModule } from '../ai/ai.module';
import { PlansModule } from '../plans/plans.module';
import { Report, ReportSchema } from '../reports/report.schema';

@Module({
  imports: [
    AIModule,
    PlansModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [MarketResearchController],
  providers: [MarketResearchService],
})
export class MarketResearchModule {}
