import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryType } from '@prisma/client';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRelevantMemory(businessId: string): Promise<string[]> {
    const memories = await this.prisma.businessMemory.findMany({
      where: { businessId, isActive: true },
      orderBy: { importance: 'desc' },
      take: 10,
    });
    return memories.map((m) => `[${m.type}] ${m.content}`);
  }

  async saveMemory(businessId: string, type: MemoryType, content: string, importance = 5) {
    return this.prisma.businessMemory.create({
      data: { businessId, type, content, importance },
    });
  }

  async extractAndSaveMemories(businessId: string, aiResponse: string) {
    // Simple heuristic: save key decisions and recommendations from AI
    const decisionPatterns = [
      /(?:recommend|suggest|should|must|priority).*?[.!]/gi,
    ];

    for (const pattern of decisionPatterns) {
      const matches = aiResponse.match(pattern);
      if (matches && matches.length > 0) {
        const topMatch = matches[0].substring(0, 500);
        await this.saveMemory(businessId, MemoryType.RECOMMENDATION, topMatch, 4);
        break;
      }
    }
  }

  async listMemories(businessId: string) {
    return this.prisma.businessMemory.findMany({
      where: { businessId, isActive: true },
      orderBy: { importance: 'desc' },
    });
  }

  async deleteMemory(id: string, businessId: string) {
    return this.prisma.businessMemory.updateMany({
      where: { id, businessId },
      data: { isActive: false },
    });
  }
}
