import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { Competitor, CompetitorDocument } from './competitor.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { BusinessContextService } from '../ai/services/business-context.service';
import { OpenAIService } from '../ai/services/openai.service';
import { AnalyzeCompetitorDto } from './competitors.dto';

const COMPETITOR_PROMPT = `You are a competitive intelligence analyst. Analyze the provided competitor in the context of the client's business, goals, current constraints, saved insights, prior conclusions, and known competitors.
Do not present unsupported competitor claims as facts. Clearly frame unknowns as assumptions or validation questions. Focus on how this business can win, not on a generic company profile.

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
  "recommendations": ["specific action for this business with owner role, time horizon, success metric, and validation step"]
}`;

@Injectable()
export class CompetitorsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    @InjectModel(Competitor.name) private readonly competitorModel: Model<CompetitorDocument>,
    private readonly orchestrator: AIOrchestrator,
    private readonly contextService: BusinessContextService,
    private readonly openai: OpenAIService,
  ) {}

  async analyze(businessId: string, userId: string, dto: AnalyzeCompetitorDto) {
    const { contextBlock } = await this.contextService.buildContext(businessId);

    const userPrompt = `Analyze competitor: ${dto.competitorName}${dto.website ? ` (${dto.website})` : ''}.
    
Our business context:
${contextBlock}

Provide deep competitive intelligence, identify the relevant alternatives, and recommend a focused response for this business. Reuse known context where relevant and note any evidence gaps.`;

    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.COMPETITOR_ANALYSIS,
      status: ReportStatus.GENERATING,
      title: `Competitor Analysis: ${dto.competitorName}`,
    });

    try {
      const content = await this.openai.chatJSON([
        { role: 'system', content: COMPETITOR_PROMPT },
        { role: 'user', content: userPrompt },
      ]);

      await this.competitorModel.findOneAndUpdate(
        { businessId: new Types.ObjectId(businessId), name: dto.competitorName },
        {
          $set: {
            analysis: content as Record<string, unknown>,
            website: dto.website,
            isDeleted: false,
          },
          $setOnInsert: {
            businessId: new Types.ObjectId(businessId),
            name: dto.competitorName,
          },
        },
        { upsert: true, new: true },
      );

      return this.reportModel.findByIdAndUpdate(
        report._id,
        {
          $set: {
            status: ReportStatus.COMPLETED,
            content: content as Record<string, unknown>,
            summary: (content as { overview?: string }).overview || '',
          },
        },
        { new: true },
      ).lean();
    } catch (error) {
      await this.reportModel.findByIdAndUpdate(report._id, { $set: { status: ReportStatus.FAILED } });
      throw error;
    }
  }

  async listCompetitors(businessId: string) {
    return this.competitorModel
      .find({ businessId: new Types.ObjectId(businessId), isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  }
}
