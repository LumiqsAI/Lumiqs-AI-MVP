import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoryController } from './memory.controller';
import { AIModule } from '../ai/ai.module';
import { User, UserSchema } from '../users/user.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';

@Module({
  imports: [
    AIModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [MemoryController],
})
export class MemoryModule {}
