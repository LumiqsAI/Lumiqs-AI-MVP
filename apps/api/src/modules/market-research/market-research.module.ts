import { Module } from '@nestjs/common';
import { MarketResearchController } from './market-research.controller';
import { MarketResearchService } from './market-research.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [MarketResearchController],
  providers: [MarketResearchService],
})
export class MarketResearchModule {}
