import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

export enum ConversationType {
  GENERAL = 'GENERAL',
  BUSINESS_ANALYSIS = 'BUSINESS_ANALYSIS',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  COMPETITOR_ANALYSIS = 'COMPETITOR_ANALYSIS',
  STRATEGY = 'STRATEGY',
  EXECUTION = 'EXECUTION',
}

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: 'New Conversation' })
  title: string;

  @Prop({ enum: ConversationType, default: ConversationType.GENERAL })
  type: ConversationType;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ businessId: 1, updatedAt: -1 });
ConversationSchema.index({ userId: 1, isDeleted: 1 });
