import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';

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
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly orchestrator: AIOrchestrator,
  ) {}

  async generateAnalysis(businessId: string, userId: string) {
    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.BUSINESS_ANALYSIS,
      status: ReportStatus.GENERATING,
      title: 'Business Analysis',
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        ANALYSIS_SYSTEM_PROMPT,
        'Perform a comprehensive business analysis for this company. Be specific and actionable.',
      );

      return this.reportModel.findByIdAndUpdate(
        report._id,
        {
          $set: {
            status: ReportStatus.COMPLETED,
            content: content as Record<string, unknown>,
            summary: (content as { executiveSummary?: string }).executiveSummary || '',
          },
        },
        { new: true },
      ).lean();
    } catch (error) {
      await this.reportModel.findByIdAndUpdate(report._id, { $set: { status: ReportStatus.FAILED } });
      throw error;
    }
  }
}
