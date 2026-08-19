import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BusinessDocument = HydratedDocument<Business>;

export enum BusinessStage {
  IDEA = 'IDEA',
  PRE_LAUNCH = 'PRE_LAUNCH',
  MVP = 'MVP',
  EARLY_REVENUE = 'EARLY_REVENUE',
  GROWTH = 'GROWTH',
  ESTABLISHED = 'ESTABLISHED',
}

@Schema({ timestamps: true, collection: 'businesses' })
export class Business {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  website?: string;

  @Prop()
  industry?: string;

  @Prop({ enum: BusinessStage, default: BusinessStage.IDEA })
  stage: BusinessStage;

  @Prop()
  country?: string;

  @Prop()
  teamSize?: string;

  @Prop()
  revenueModel?: string;

  @Prop()
  targetAudience?: string;

  @Prop()
  description?: string;

  @Prop()
  goals?: string;

  @Prop()
  challenges?: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ ownerId: 1, isDeleted: 1 });
