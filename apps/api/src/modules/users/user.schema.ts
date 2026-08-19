import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserPlan {
  EXPLORER = 'explorer',
  FOUNDER = 'founder',
  STUDIO = 'studio',
  CUSTOM = 'custom',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

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

  @Prop({ enum: UserPlan, default: UserPlan.EXPLORER })
  plan: UserPlan;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
