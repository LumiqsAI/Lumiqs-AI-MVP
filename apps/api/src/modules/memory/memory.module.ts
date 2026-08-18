import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [MemoryController],
})
export class MemoryModule {}
