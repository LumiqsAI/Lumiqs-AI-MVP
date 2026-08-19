import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from '../../businesses/business.schema';
import { BusinessMemory, BusinessMemoryDocument } from '../../memory/business-memory.schema';
import { Message, MessageDocument } from '../../conversations/message.schema';

export interface BuiltContext {
  business: BusinessDocument;
  memories: BusinessMemoryDocument[];
  recentMessages: MessageDocument[];
  contextBlock: string;
}

@Injectable()
export class BusinessContextService {
  private readonly logger = new Logger(BusinessContextService.name);

  constructor(
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(BusinessMemory.name) private readonly memoryModel: Model<BusinessMemoryDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
  ) {}

  async buildContext(businessId: string, conversationId?: string): Promise<BuiltContext> {
    const oid = new Types.ObjectId(businessId);
    const [business, memories, recentMessages] = await Promise.all([
      this.businessModel.findById(oid).orFail(),
      this.memoryModel.find({ businessId: oid, isActive: true }).sort({ importance: -1 }).limit(10),
      conversationId && Types.ObjectId.isValid(conversationId)
        ? this.messageModel
            .find({ conversationId: new Types.ObjectId(conversationId) })
            .sort({ createdAt: 1 })
            .limit(20)
        : Promise.resolve([]),
    ]);

    const contextBlock = this.buildContextBlock(business, memories);
    return { business, memories, recentMessages, contextBlock };
  }

  private buildContextBlock(business: BusinessDocument, memories: BusinessMemoryDocument[]): string {
    const lines = [
      '## Business Context',
      '',
      `**Company:** ${business.name}`,
      `**Industry:** ${business.industry || 'Not specified'}`,
      `**Stage:** ${business.stage}`,
      `**Country:** ${business.country || 'Not specified'}`,
      `**Team Size:** ${business.teamSize || 'Not specified'}`,
      `**Revenue Model:** ${business.revenueModel || 'Not specified'}`,
      `**Target Audience:** ${business.targetAudience || 'Not specified'}`,
      '',
      `**Description:** ${business.description || 'Not provided'}`,
      '',
      `**Goals:** ${business.goals || 'Not provided'}`,
      '',
      `**Challenges:** ${business.challenges || 'Not provided'}`,
    ];

    if (memories.length > 0) {
      lines.push('', '## Business Memory', '');
      memories.forEach((m, i) => {
        lines.push(`${i + 1}. [${m.type}] ${m.value}`);
      });
    }

    return lines.join('\n');
  }
}
