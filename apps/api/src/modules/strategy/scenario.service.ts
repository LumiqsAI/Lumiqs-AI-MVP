import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

const SCENARIO_PROMPT = `You are a senior market strategist. Compare the provided scenarios side-by-side for the given business.
For each scenario provide an honest, evidence-aware assessment. Label estimates clearly.

Return JSON with this exact structure:
{
  "question": "string — the decision being evaluated",
  "recommendation": "string — which scenario you recommend and why",
  "scenarios": [
    {
      "name": "string",
      "marketOpportunity": "string",
      "competitionLevel": "LOW|MEDIUM|HIGH",
      "revenuePotential": "string",
      "customerAcquisitionCost": "string",
      "timeToRevenue": "string",
      "keyRisks": ["string"],
      "keyAdvantages": ["string"],
      "score": 0
    }
  ],
  "keyFactors": ["string"],
  "nextSteps": ["string"]
}`;

@Injectable()
export class ScenarioService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly orchestrator: AIOrchestrator,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async compare(
    businessId: string,
    userId: string,
    userPlan: UserPlan,
    question: string,
    scenarios: string[],
  ) {
    await this.planLimits.checkReportLimit(userId, userPlan);

    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.CUSTOM,
      status: ReportStatus.GENERATING,
      title: `Scenario Comparison: ${question.substring(0, 60)}`,
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        SCENARIO_PROMPT,
        `Compare these scenarios for the business: ${scenarios.map((s, i) => `Scenario ${i + 1}: ${s}`).join(' | ')}. The decision question is: "${question}". Score each scenario 0-100.`,
      );

      return this.reportModel.findByIdAndUpdate(
        report._id,
        {
          $set: {
            status: ReportStatus.COMPLETED,
            content: content as Record<string, unknown>,
            summary: (content as { recommendation?: string }).recommendation || '',
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
