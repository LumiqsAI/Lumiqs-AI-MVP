import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { ReportType, ReportStatus } from '@prisma/client';

const ANALYSIS_SYSTEM_PROMPT = `You are a senior business analyst. Analyze the provided business and return a structured JSON response.
Be analytical, specific, and practical. Label any estimates or assumptions clearly.

Return JSON with this exact structure:
{
  "executiveSummary": "string",
  "currentSituation": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "risks": ["string"],
  "recommendations": [
    {
      "recommendation": "string",
      "reason": "string",
      "priority": "HIGH|MEDIUM|LOW",
      "expectedImpact": "string",
      "implementationNotes": "string"
    }
  ],
  "priorityActions": ["string"]
}`;

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: AIOrchestrator,
  ) {}

  async generateAnalysis(businessId: string, userId: string) {
    // Create report placeholder
    const report = await this.prisma.report.create({
      data: {
        businessId,
        userId,
        type: ReportType.BUSINESS_ANALYSIS,
        status: ReportStatus.GENERATING,
        title: 'Business Analysis',
      },
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        ANALYSIS_SYSTEM_PROMPT,
        'Perform a comprehensive business analysis for this company. Be specific and actionable.',
      );

      const updated = await this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.COMPLETED,
          content: content as object,
          summary: (content as { executiveSummary?: string }).executiveSummary || '',
        },
      });

      return updated;
    } catch (error) {
      await this.prisma.report.update({
        where: { id: report.id },
        data: { status: ReportStatus.FAILED },
      });
      throw error;
    }
  }
}
