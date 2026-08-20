import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

const CHALLENGE_PROMPT = `You are a rigorous business strategist and devil's advocate. Your job is to stress-test the user's stated strategy.
Be honest, specific, and constructive. Do not fabricate data — label estimates clearly.

Return JSON with this exact structure:
{
  "strategyStatement": "string — restate what the user said",
  "overallVerdict": "STRONG|NEEDS_WORK|RISKY",
  "verdictSummary": "string",
  "assumptions": [
    {
      "assumption": "string",
      "risk": "LOW|MEDIUM|HIGH",
      "explanation": "string"
    }
  ],
  "weakPoints": ["string"],
  "strengths": ["string"],
  "experiments": [
    {
      "hypothesis": "string",
      "howToTest": "string",
      "timeframe": "string",
      "successSignal": "string"
    }
  ],
  "alternativesToConsider": ["string"],
  "nextSteps": ["string"]
}`;

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly orchestrator: AIOrchestrator,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async challenge(
    businessId: string,
    userId: string,
    userPlan: UserPlan,
    strategyStatement: string,
  ) {
    await this.planLimits.checkReportLimit(userId, userPlan);

    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.CUSTOM,
      status: ReportStatus.GENERATING,
      title: `Strategy Challenge: ${strategyStatement.substring(0, 60)}`,
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        CHALLENGE_PROMPT,
        `Challenge this strategy statement: "${strategyStatement}". Be rigorous — identify every hidden assumption, weak point, and what the founder should validate before committing.`,
      );

      return this.reportModel.findByIdAndUpdate(
        report._id,
        {
          $set: {
            status: ReportStatus.COMPLETED,
            content: content as Record<string, unknown>,
            summary: (content as { verdictSummary?: string }).verdictSummary || '',
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
