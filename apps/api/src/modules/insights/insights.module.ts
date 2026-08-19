import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { Insight, InsightSchema } from './insight.schema';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Insight.name, schema: InsightSchema }]),
    PlansModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
