import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InsightDocument = HydratedDocument<Insight>;

export enum InsightCategory {
  STRATEGY = 'STRATEGY',
  MARKET = 'MARKET',
  CUSTOMER = 'CUSTOMER',
  COMPETITOR = 'COMPETITOR',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  GENERAL = 'GENERAL',
}

@Schema({ timestamps: true, collection: 'insights' })
export class Insight {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: InsightCategory, default: InsightCategory.GENERAL })
  category: InsightCategory;

  @Prop({ enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  sourceConversationId?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);
InsightSchema.index({ businessId: 1, createdAt: -1 });
