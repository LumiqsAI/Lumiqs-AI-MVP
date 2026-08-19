import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiUsageDocument = HydratedDocument<AiUsage>;

@Schema({ timestamps: true, collection: 'ai_usage' })
export class AiUsage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business' })
  businessId?: Types.ObjectId;

  @Prop({ required: true })
  requestType: string;

  @Prop({ required: true })
  model: string;

  @Prop({ default: 0 })
  inputTokens: number;

  @Prop({ default: 0 })
  outputTokens: number;

  @Prop({ default: 0 })
  totalTokens: number;

  @Prop({ default: 0 })
  latencyMs: number;

  @Prop({ enum: ['success', 'error'], default: 'success' })
  status: string;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);
AiUsageSchema.index({ userId: 1, createdAt: -1 });
