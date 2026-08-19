import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExecutionPlanDocument = HydratedDocument<ExecutionPlan>;
export type ExecutionTaskDocument = HydratedDocument<ExecutionTask>;

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Schema({ timestamps: true, collection: 'execution_plans' })
export class ExecutionPlan {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  objective?: string;

  @Prop()
  timeframe?: string;

  @Prop({ type: [Object], default: [] })
  milestones: Array<{ title: string; description: string; targetDate: string; successMetric: string }>;

  @Prop({ type: Object })
  rawContent?: Record<string, unknown>;
}

export const ExecutionPlanSchema = SchemaFactory.createForClass(ExecutionPlan);
ExecutionPlanSchema.index({ businessId: 1, createdAt: -1 });

@Schema({ timestamps: true, collection: 'execution_tasks' })
export class ExecutionTask {
  @Prop({ type: Types.ObjectId, ref: 'ExecutionPlan', required: true, index: true })
  executionPlanId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' })
  priority: string;

  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop()
  week?: number;

  @Prop()
  month?: number;

  @Prop({ type: [String], default: [] })
  dependencies: string[];

  @Prop()
  expectedOutcome?: string;
}

export const ExecutionTaskSchema = SchemaFactory.createForClass(ExecutionTask);
ExecutionTaskSchema.index({ executionPlanId: 1 });
ExecutionTaskSchema.index({ businessId: 1 });
