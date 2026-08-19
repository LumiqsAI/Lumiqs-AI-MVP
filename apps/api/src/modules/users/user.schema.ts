import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  authProviderId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: Object, default: {} })
  preferences: Record<string, unknown>;

  @Prop({ default: false })
  onboardingCompleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
