import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from '../../businesses/business.schema';
import { BusinessMemory, BusinessMemoryDocument } from '../../memory/business-memory.schema';
import { Message, MessageDocument } from '../../conversations/message.schema';
import { KnowledgeService } from './knowledge.service';
import { Report, ReportDocument, ReportStatus } from '../../reports/report.schema';
import { Insight, InsightDocument } from '../../insights/insight.schema';
import { Competitor, CompetitorDocument } from '../../competitors/competitor.schema';

export interface BuiltContext {
  business: BusinessDocument;
  memories: BusinessMemoryDocument[];
  recentMessages: MessageDocument[];
  reports: ReportDocument[];
  insights: InsightDocument[];
  competitors: CompetitorDocument[];
  contextBlock: string;
}

@Injectable()
export class BusinessContextService {
  private readonly logger = new Logger(BusinessContextService.name);

  constructor(
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(BusinessMemory.name) private readonly memoryModel: Model<BusinessMemoryDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    @InjectModel(Insight.name) private readonly insightModel: Model<InsightDocument>,
    @InjectModel(Competitor.name) private readonly competitorModel: Model<CompetitorDocument>,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async buildContext(businessId: string, conversationId?: string, question = ''): Promise<BuiltContext> {
    const oid = new Types.ObjectId(businessId);
    const [business, memories, recentMessages, reports, insights, competitors] = await Promise.all([
      this.businessModel.findById(oid).orFail(),
      this.memoryModel.find({ businessId: oid, isActive: true }).sort({ importance: -1 }).limit(10),
      conversationId && Types.ObjectId.isValid(conversationId)
        ? this.messageModel
            .find({ conversationId: new Types.ObjectId(conversationId) })
            .sort({ createdAt: 1 })
            .limit(20)
        : Promise.resolve([]),
      this.reportModel
        .find({ businessId: oid, status: ReportStatus.COMPLETED, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(6),
      this.insightModel
        .find({ businessId: oid, isDeleted: false })
        .sort({ priority: -1, createdAt: -1 })
        .limit(10),
      this.competitorModel
        .find({ businessId: oid, isDeleted: false })
        .sort({ updatedAt: -1 })
        .limit(6),
    ]);

    const playbook = this.knowledgeService.format(this.knowledgeService.retrieve(question));
    const contextBlock = this.buildContextBlock(business, memories, reports, insights, competitors, playbook);
    return { business, memories, recentMessages, reports, insights, competitors, contextBlock };
  }

  /** Ensures every AI output is based on a complete, usable business profile. */
  async assertProfileReady(businessId: string): Promise<void> {
    const business = await this.businessModel.findById(businessId).lean();
    if (!business) return;

    const requiredFields: Array<[keyof Business, string]> = [
      ['name', 'business name'], ['website', 'website'], ['industry', 'industry'],
      ['country', 'target region or country'], ['teamSize', 'team size'],
      ['revenueModel', 'business model'], ['targetAudience', 'target customers'],
      ['description', 'business description'], ['goals', 'main goal'], ['challenges', 'biggest challenges'],
    ];
    const missing = requiredFields
      .filter(([key]) => typeof business[key] !== 'string' || !(business[key] as string).trim())
      .map(([, label]) => label);

    if (missing.length > 0) {
      throw new UnprocessableEntityException(
        `Complete your business profile before using AI services. Missing: ${missing.join(', ')}.`,
      );
    }
  }

  private buildContextBlock(
    business: BusinessDocument,
    memories: BusinessMemoryDocument[],
    reports: ReportDocument[],
    insights: InsightDocument[],
    competitors: CompetitorDocument[],
    playbook: string,
  ): string {
    const lines = [
      '## Business Context',
      '',
      `**Company:** ${business.name}`,
      `**Industry:** ${business.industry || 'Not specified'}`,
      `**Stage:** ${business.stage}`,
      `**Country:** ${business.country || 'Not specified'}`,
      `**Team Size:** ${business.teamSize || 'Not specified'}`,
      `**Revenue Model:** ${business.revenueModel || 'Not specified'}`,
      `**Target Audience:** ${business.targetAudience || 'Not specified'}`,
      '',
      `**Description:** ${business.description || 'Not provided'}`,
      '',
      `**Goals:** ${business.goals || 'Not provided'}`,
      '',
      `**Challenges:** ${business.challenges || 'Not provided'}`,
    ];

    if (memories.length > 0) {
      lines.push('', '## Business Memory', '');
      memories.forEach((m, i) => {
        lines.push(`${i + 1}. [${m.type}] ${m.value}`);
      });
    }

    if (insights.length > 0) {
      lines.push('', '## Saved Business Insights', '');
      insights.forEach((insight, index) => {
        lines.push(`${index + 1}. [${insight.category}; ${insight.priority}] ${this.truncate(insight.title, 120)}: ${this.truncate(insight.content, 400)}`);
      });
    }

    if (reports.length > 0) {
      lines.push('', '## Previous Report Conclusions', '');
      reports.forEach((report, index) => {
        const conclusion = report.summary || this.getReportSummary(report.content);
        lines.push(`${index + 1}. [${report.type}] ${report.title}: ${this.truncate(conclusion || 'No summary available', 500)}`);
      });
    }

    if (competitors.length > 0) {
      lines.push('', '## Known Competitor Intelligence', '');
      competitors.forEach((competitor, index) => {
        const analysis = competitor.analysis || {};
        const overview = typeof analysis.overview === 'string' ? analysis.overview : '';
        const positioning = typeof analysis.positioning === 'string' ? analysis.positioning : '';
        lines.push(`${index + 1}. ${competitor.name}${competitor.website ? ` (${competitor.website})` : ''}: ${this.truncate([overview, positioning].filter(Boolean).join(' '), 450) || 'Analysis saved; verify details before acting.'}`);
      });
    }

    if (playbook) lines.push('', playbook);

    return lines.join('\n');
  }

  private getReportSummary(content?: Record<string, unknown>): string {
    if (!content) return '';
    const candidates = [content.executiveSummary, content.currentSituation, content.industryOverview, content.overview];
    return candidates.find((value): value is string => typeof value === 'string') || '';
  }

  private truncate(value: string, maxLength: number): string {
    return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}…`;
  }
}
