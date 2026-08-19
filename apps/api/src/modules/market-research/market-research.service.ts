import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

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
  "recommendations": ["specific recommendation with target segment, owner role, time horizon, metric, dependency, and validation step"]
}`;

@Injectable()
export class MarketResearchService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly orchestrator: AIOrchestrator,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async generate(businessId: string, userId: string, userPlan: UserPlan) {
    await this.planLimits.checkReportLimit(userId, userPlan);
    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.MARKET_RESEARCH,
      status: ReportStatus.GENERATING,
      title: 'Market Research',
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        MARKET_RESEARCH_PROMPT,
        'Conduct deep market research anchored in this business context. Prioritize the most relevant customer segments, jobs-to-be-done, buying triggers, alternatives, route-to-market choices, evidence gaps, and experiments the team can run next.',
      );

      return this.reportModel.findByIdAndUpdate(
        report._id,
        {
          $set: {
            status: ReportStatus.COMPLETED,
            content: content as Record<string, unknown>,
            summary: (content as { industryOverview?: string }).industryOverview || '',
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
