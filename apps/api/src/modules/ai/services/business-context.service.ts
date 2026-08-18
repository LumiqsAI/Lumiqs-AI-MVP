import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Business, BusinessMemory, Message } from '@prisma/client';

export interface BuiltContext {
  business: Business;
  memories: BusinessMemory[];
  recentMessages: Message[];
  contextBlock: string;
}

@Injectable()
export class BusinessContextService {
  private readonly logger = new Logger(BusinessContextService.name);

  constructor(private readonly prisma: PrismaService) {}

  async buildContext(businessId: string, conversationId?: string): Promise<BuiltContext> {
    const [business, memories, recentMessages] = await Promise.all([
      this.prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
      this.prisma.businessMemory.findMany({
        where: { businessId, isActive: true },
        orderBy: { importance: 'desc' },
        take: 10,
      }),
      conversationId
        ? this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 20,
          })
        : Promise.resolve([]),
    ]);

    const contextBlock = this.buildContextBlock(business, memories);
    return { business, memories, recentMessages, contextBlock };
  }

  private buildContextBlock(business: Business, memories: BusinessMemory[]): string {
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
        lines.push(`${i + 1}. [${m.type}] ${m.content}`);
      });
    }

    return lines.join('\n');
  }
}
