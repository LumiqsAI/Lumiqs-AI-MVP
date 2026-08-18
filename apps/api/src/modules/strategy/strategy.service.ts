import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { ReportType, ReportStatus } from '@prisma/client';

const STRATEGY_PROMPT = `You are a senior business strategist. Create a comprehensive business strategy for the provided company.
Every recommendation must include reason, priority, expected impact, and implementation notes.
Do NOT fabricate market data — label estimates clearly.

Return JSON with this exact structure:
{
  "executiveSummary": "string",
  "revenueStrategy": {
    "recommendation": "string",
    "reason": "string",
    "priority": "HIGH|MEDIUM|LOW",
    "expectedImpact": "string",
    "implementationNotes": "string"
  },
  "pricingStrategy": {
    "recommendation": "string",
    "reason": "string",
    "priority": "HIGH|MEDIUM|LOW",
    "expectedImpact": "string",
    "implementationNotes": "string"
  },
  "marketingStrategy": {
    "recommendation": "string",
    "reason": "string",
    "priority": "HIGH|MEDIUM|LOW",
    "expectedImpact": "string",
    "implementationNotes": "string"
  },
  "salesStrategy": {
    "recommendation": "string",
    "reason": "string",
    "priority": "HIGH|MEDIUM|LOW",
    "expectedImpact": "string",
    "implementationNotes": "string"
  },
  "growthStrategy": {
    "recommendation": "string",
    "reason": "string",
    "priority": "HIGH|MEDIUM|LOW",
    "expectedImpact": "string",
    "implementationNotes": "string"
  }
}`;

@Injectable()
export class StrategyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: AIOrchestrator,
  ) {}

  async generate(businessId: string, userId: string) {
    const report = await this.prisma.report.create({
      data: {
        businessId,
        userId,
        type: ReportType.STRATEGY,
        status: ReportStatus.GENERATING,
        title: 'Business Strategy',
      },
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        STRATEGY_PROMPT,
        'Generate a comprehensive business strategy covering revenue, pricing, marketing, sales, and growth.',
      );

      return this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.COMPLETED,
          content: content as object,
          summary: (content as { executiveSummary?: string }).executiveSummary || '',
        },
      });
    } catch (error) {
      await this.prisma.report.update({ where: { id: report.id }, data: { status: ReportStatus.FAILED } });
      throw error;
    }
  }
}
