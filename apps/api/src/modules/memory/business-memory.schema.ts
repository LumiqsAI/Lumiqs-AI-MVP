import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BusinessMemoryDocument = HydratedDocument<BusinessMemory>;

export enum MemoryType {
  BUSINESS_FACT = 'BUSINESS_FACT',
  CUSTOMER_INFO = 'CUSTOMER_INFO',
  GOAL = 'GOAL',
  CHALLENGE = 'CHALLENGE',
  DECISION = 'DECISION',
  RECOMMENDATION = 'RECOMMENDATION',
  INSIGHT = 'INSIGHT',
  PREFERENCE = 'PREFERENCE',
}

@Schema({ timestamps: true, collection: 'business_memories' })
export class BusinessMemory {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ enum: MemoryType, required: true })
  type: MemoryType;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  source?: string;

  @Prop({ enum: ['high', 'medium', 'low'], default: 'medium' })
  confidence: string;

  @Prop({ min: 1, max: 10, default: 5 })
  importance: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Number] })
  embedding?: number[];
}

export const BusinessMemorySchema = SchemaFactory.createForClass(BusinessMemory);
BusinessMemorySchema.index({ businessId: 1, importance: -1 });
BusinessMemorySchema.index({ businessId: 1, isActive: 1 });
