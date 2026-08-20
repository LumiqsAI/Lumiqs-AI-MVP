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

  @Prop({ required: true })
  website: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ enum: BusinessStage, default: BusinessStage.IDEA })
  stage: BusinessStage;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  teamSize: string;

  @Prop({ required: true })
  revenueModel: string;

  @Prop({ required: true })
  targetAudience: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  goals: string;

  @Prop({ required: true })
  challenges: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ enum: ['manual', 'public_website'], default: 'manual' })
  profileSource: 'manual' | 'public_website';

  @Prop({ type: Object })
  publicProfile?: Record<string, unknown>;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ ownerId: 1, isDeleted: 1 });
