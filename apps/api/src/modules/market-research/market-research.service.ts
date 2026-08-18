import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { ReportType, ReportStatus } from '@prisma/client';

const MARKET_RESEARCH_PROMPT = `You are a senior market research analyst. Conduct thorough market research for the provided business.
Do NOT fabricate specific market size numbers — label all estimates as "Estimated" or "Requires validation".

Return JSON with this exact structure:
{
  "industryOverview": "string",
  "marketSize": "string (label as Estimated if not certain)",
  "marketGrowth": "string",
  "customerPersonas": [
    {
      "name": "string",
      "description": "string",
      "painPoints": ["string"],
      "goals": ["string"]
    }
  ],
  "painPoints": ["string"],
  "trends": ["string"],
  "opportunities": ["string"],
  "risks": ["string"],
  "recommendations": ["string"]
}`;

@Injectable()
export class MarketResearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: AIOrchestrator,
  ) {}

  async generate(businessId: string, userId: string) {
    const report = await this.prisma.report.create({
      data: {
        businessId,
        userId,
        type: ReportType.MARKET_RESEARCH,
        status: ReportStatus.GENERATING,
        title: 'Market Research',
      },
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        MARKET_RESEARCH_PROMPT,
        'Conduct comprehensive market research for this business. Focus on actionable insights.',
      );

      return this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.COMPLETED,
          content: content as object,
          summary: (content as { industryOverview?: string }).industryOverview || '',
        },
      });
    } catch (error) {
      await this.prisma.report.update({ where: { id: report.id }, data: { status: ReportStatus.FAILED } });
      throw error;
    }
  }
}
