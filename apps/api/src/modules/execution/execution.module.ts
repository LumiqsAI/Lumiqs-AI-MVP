import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';
import { AIModule } from '../ai/ai.module';
import { PlansModule } from '../plans/plans.module';
import { Report, ReportSchema } from '../reports/report.schema';
import { ExecutionTask, ExecutionTaskSchema } from './execution.schema';

@Module({
  imports: [
    AIModule,
    PlansModule,
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: ExecutionTask.name, schema: ExecutionTaskSchema },
    ]),
  ],
  controllers: [ExecutionController],
  providers: [ExecutionService],
})
export class ExecutionModule {}
