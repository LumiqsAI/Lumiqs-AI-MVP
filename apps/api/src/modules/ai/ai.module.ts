import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIController } from './ai.controller';
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { OpenAIService } from './services/openai.service';
import { BusinessContextService } from './services/business-context.service';
import { MemoryService } from './services/memory.service';
import { KnowledgeService } from './services/knowledge.service';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Conversation, ConversationSchema } from '../conversations/conversation.schema';
import { Message, MessageSchema } from '../conversations/message.schema';
import { BusinessMemory, BusinessMemorySchema } from '../memory/business-memory.schema';
import { AiUsage, AiUsageSchema } from './ai-usage.schema';
import { Report, ReportSchema } from '../reports/report.schema';
import { Insight, InsightSchema } from '../insights/insight.schema';
import { Competitor, CompetitorSchema } from '../competitors/competitor.schema';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: BusinessMemory.name, schema: BusinessMemorySchema },
      { name: AiUsage.name, schema: AiUsageSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Insight.name, schema: InsightSchema },
      { name: Competitor.name, schema: CompetitorSchema },
    ]),
    PlansModule,
  ],
  controllers: [AIController],
  providers: [AIOrchestrator, OpenAIService, BusinessContextService, MemoryService, KnowledgeService],
  exports: [AIOrchestrator, OpenAIService, BusinessContextService, MemoryService, KnowledgeService],
})
export class AIModule {}
