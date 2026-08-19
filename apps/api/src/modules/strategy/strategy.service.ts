import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';

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
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly orchestrator: AIOrchestrator,
  ) {}

  async generate(businessId: string, userId: string) {
    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.STRATEGY,
      status: ReportStatus.GENERATING,
      title: 'Business Strategy',
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        STRATEGY_PROMPT,
        'Generate a comprehensive business strategy covering revenue, pricing, marketing, sales, and growth.',
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
