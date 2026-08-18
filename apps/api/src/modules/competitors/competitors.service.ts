import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { BusinessContextService } from '../ai/services/business-context.service';
import { OpenAIService } from '../ai/services/openai.service';
import { ReportType, ReportStatus } from '@prisma/client';
import { AnalyzeCompetitorDto } from './competitors.dto';

const COMPETITOR_PROMPT = `You are a competitive intelligence analyst. Analyze the provided competitor in the context of the client's business.

Return JSON with this exact structure:
{
  "overview": "string",
  "businessModel": "string",
  "targetAudience": "string",
  "pricing": "string",
  "features": ["string"],
  "positioning": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "swot": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "competitiveAdvantages": ["string"],
  "threats": ["string"],
  "recommendations": ["string"]
}`;

@Injectable()
export class CompetitorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: AIOrchestrator,
    private readonly contextService: BusinessContextService,
    private readonly openai: OpenAIService,
  ) {}

  async analyze(businessId: string, userId: string, dto: AnalyzeCompetitorDto) {
    const { contextBlock } = await this.contextService.buildContext(businessId);

    const userPrompt = `Analyze competitor: ${dto.competitorName}${dto.website ? ` (${dto.website})` : ''}.
    
Our business context:
${contextBlock}

Provide competitive intelligence and strategic recommendations.`;

    const report = await this.prisma.report.create({
      data: {
        businessId,
        userId,
        type: ReportType.COMPETITOR_ANALYSIS,
        status: ReportStatus.GENERATING,
        title: `Competitor Analysis: ${dto.competitorName}`,
      },
    });

    try {
      const content = await this.openai.chatJSON([
        { role: 'system', content: COMPETITOR_PROMPT },
        { role: 'user', content: userPrompt },
      ]);

      // Save competitor record
      const existing = await this.prisma.competitor.findFirst({
        where: { businessId, name: dto.competitorName },
      });
      if (existing) {
        await this.prisma.competitor.update({
          where: { id: existing.id },
          data: { analysis: content as object, website: dto.website },
        });
      } else {
        await this.prisma.competitor.create({
          data: {
            businessId,
            name: dto.competitorName,
            website: dto.website,
            analysis: content as object,
          },
        });
      }

      return this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.COMPLETED,
          content: content as object,
          summary: (content as { overview?: string }).overview || '',
        },
      });
    } catch (error) {
      await this.prisma.report.update({ where: { id: report.id }, data: { status: ReportStatus.FAILED } });
      throw error;
    }
  }

  async listCompetitors(businessId: string) {
    return this.prisma.competitor.findMany({
      where: { businessId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}
