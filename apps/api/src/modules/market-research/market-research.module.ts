import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketResearchController } from './market-research.controller';
import { MarketResearchService } from './market-research.service';
import { AIModule } from '../ai/ai.module';
import { Report, ReportSchema } from '../reports/report.schema';

@Module({
  imports: [
    AIModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [MarketResearchController],
  providers: [MarketResearchService],
})
export class MarketResearchModule {}
