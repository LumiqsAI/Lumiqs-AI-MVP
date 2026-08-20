import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

export enum ReportType {
  BUSINESS_ANALYSIS = 'BUSINESS_ANALYSIS',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  COMPETITOR_ANALYSIS = 'COMPETITOR_ANALYSIS',
  STRATEGY = 'STRATEGY',
  EXECUTION = 'EXECUTION',
  COMBINED = 'COMBINED',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'reports' })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: ReportType, required: true })
  type: ReportType;

  @Prop({ enum: ReportStatus, default: ReportStatus.GENERATING })
  status: ReportStatus;

  @Prop()
  summary?: string;

  @Prop({ type: Object })
  content?: Record<string, unknown>;

  @Prop()
  pdfUrl?: string;

  @Prop({ type: String, index: true, sparse: true })
  shareToken?: string;

  @Prop({ default: false })
  isShared: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ businessId: 1, createdAt: -1 });
ReportSchema.index({ userId: 1, isDeleted: 1 });
