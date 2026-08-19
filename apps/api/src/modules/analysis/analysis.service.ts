import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

const ANALYSIS_SYSTEM_PROMPT = `You are a senior business analyst. Analyze the provided business and return a structured JSON response.
Be analytical, specific, and practical. Label any estimates or assumptions clearly.

Return JSON with this exact structure:
{
  "executiveSummary": "string",
  "currentSituation": "string",
  "strengths": ["specific evidence-based strength"],
  "weaknesses": ["specific constraint or gap"],
  "opportunities": ["specific opportunity linked to business goals"],
  "risks": ["specific risk with an early warning signal"],
  "recommendations": [
    {
      "recommendation": "string",
      "reason": "string",
      "priority": "HIGH|MEDIUM|LOW",
      "expectedImpact": "string",
      "implementationNotes": "first steps, owner role, 30/60/90-day horizon, metric, dependency, and validation needed"
    }
  ],
  "priorityActions": ["sequenced action including owner role, deadline, and success metric"]
}`;

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly orchestrator: AIOrchestrator,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async generateAnalysis(businessId: string, userId: string, userPlan: UserPlan = UserPlan.EXPLORER) {
    await this.planLimits.checkReportLimit(userId, userPlan);
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
        'Perform a deep, decision-grade business analysis. Use all available business context and previous learnings. Surface the three most important decisions, evidence gaps, trade-offs, and a sequenced action plan.',
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
