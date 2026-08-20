import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { ScenarioService } from './scenario.service';
import { ChallengeService } from './challenge.service';
import { AIModule } from '../ai/ai.module';
import { PlansModule } from '../plans/plans.module';
import { Report, ReportSchema } from '../reports/report.schema';

@Module({
  imports: [
    AIModule,
    PlansModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [StrategyController],
  providers: [StrategyService, ScenarioService, ChallengeService],
})
export class StrategyModule {}
