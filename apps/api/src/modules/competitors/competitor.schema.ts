import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompetitorDocument = HydratedDocument<Competitor>;

@Schema({ timestamps: true, collection: 'competitors' })
export class Competitor {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  website?: string;

  @Prop({ type: Object })
  analysis?: Record<string, unknown>;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CompetitorSchema = SchemaFactory.createForClass(Competitor);
CompetitorSchema.index({ businessId: 1, isDeleted: 1 });
