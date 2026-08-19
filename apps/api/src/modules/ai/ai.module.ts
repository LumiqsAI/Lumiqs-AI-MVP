import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIController } from './ai.controller';
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { OpenAIService } from './services/openai.service';
import { BusinessContextService } from './services/business-context.service';
import { MemoryService } from './services/memory.service';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Conversation, ConversationSchema } from '../conversations/conversation.schema';
import { Message, MessageSchema } from '../conversations/message.schema';
import { BusinessMemory, BusinessMemorySchema } from '../memory/business-memory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: BusinessMemory.name, schema: BusinessMemorySchema },
    ]),
  ],
  controllers: [AIController],
  providers: [AIOrchestrator, OpenAIService, BusinessContextService, MemoryService],
  exports: [AIOrchestrator, OpenAIService, BusinessContextService, MemoryService],
})
export class AIModule {}
