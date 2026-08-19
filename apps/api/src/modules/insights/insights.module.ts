import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { Insight, InsightSchema } from './insight.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Insight.name, schema: InsightSchema }]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
