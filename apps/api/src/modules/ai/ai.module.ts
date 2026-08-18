import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { OpenAIService } from './services/openai.service';
import { BusinessContextService } from './services/business-context.service';
import { MemoryService } from './services/memory.service';

@Module({
  controllers: [AIController],
  providers: [AIOrchestrator, OpenAIService, BusinessContextService, MemoryService],
  exports: [AIOrchestrator, OpenAIService, BusinessContextService, MemoryService],
})
export class AIModule {}
