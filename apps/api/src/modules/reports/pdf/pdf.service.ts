import { Injectable, Logger } from '@nestjs/common';
import type { ReportDocument } from '../report.schema';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateReportPdf(report: ReportDocument, businessName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const content = report.content as Record<string, unknown> | null;

      // ── Header ──────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 80).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
        .text('LUMIQS AI', 50, 25);
      doc.fontSize(10).font('Helvetica').fillColor('#94a3b8')
        .text('AI-Powered Business Intelligence', 50, 52);
      doc.fillColor('#ffffff').fontSize(10)
        .text(
          `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          0, 52,
          { align: 'right', width: doc.page.width - 50 },
        );

      doc.moveDown(3);

      // ── Title block ─────────────────────────────────────────
      doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold')
        .text(report.title, { align: 'center' });
      doc.fontSize(13).font('Helvetica').fillColor('#64748b')
        .text(businessName, { align: 'center' });
      doc.moveDown(0.5);

      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.moveDown(1);

      if (!content) {
        doc.fillColor('#64748b').fontSize(12).text('Report content is not available.');
        doc.end();
        return;
      }

      // ── Executive Summary ───────────────────────────────────
      if (content.executiveSummary) {
        this.sectionHeader(doc, 'Executive Summary');
        doc.fillColor('#334155').fontSize(11).font('Helvetica')
          .text(String(content.executiveSummary), { lineGap: 4 });
        doc.moveDown(1);
      }

      // ── Dynamic array sections ───────────────────────────────
      const arraySections: Record<string, string> = {
        strengths: 'Strengths',
        weaknesses: 'Weaknesses',
        opportunities: 'Opportunities',
        risks: 'Risks',
        recommendations: 'Recommendations',
        priorityActions: 'Priority Actions',
        trends: 'Market Trends',
        painPoints: 'Customer Pain Points',
        monthlyGoals: 'Monthly Goals',
        successMetrics: 'Success Metrics',
      };

      for (const [key, label] of Object.entries(arraySections)) {
        const val = content[key];
        if (!val) continue;

        this.sectionHeader(doc, label);

        if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === 'string') {
              doc.fillColor('#334155').fontSize(11).font('Helvetica')
                .text(`• ${item}`, { indent: 10, lineGap: 3 });
            } else if (typeof item === 'object' && item !== null) {
              const obj = item as Record<string, unknown>;
              const title = obj.recommendation || obj.title || obj.name || '';
              if (title) {
                doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(`• ${title}`, { indent: 10 });
              }
              if (obj.reason) doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`  Reason: ${obj.reason}`, { indent: 20, lineGap: 2 });
              if (obj.priority) doc.fillColor('#64748b').fontSize(10).text(`  Priority: ${obj.priority}`, { indent: 20, lineGap: 2 });
              if (obj.expectedImpact) doc.fillColor('#64748b').fontSize(10).text(`  Impact: ${obj.expectedImpact}`, { indent: 20, lineGap: 2 });
              doc.moveDown(0.3);
            }
          }
        }
        doc.moveDown(0.8);
      }

      // ── Strategy sections ────────────────────────────────────
      const strategyKeys = ['revenueStrategy', 'pricingStrategy', 'marketingStrategy', 'salesStrategy', 'growthStrategy'];
      const strategyLabels: Record<string, string> = {
        revenueStrategy: 'Revenue Strategy',
        pricingStrategy: 'Pricing Strategy',
        marketingStrategy: 'Marketing Strategy',
        salesStrategy: 'Sales Strategy',
        growthStrategy: 'Growth Strategy',
      };

      for (const key of strategyKeys) {
        const val = content[key] as Record<string, unknown> | undefined;
        if (!val) continue;
        this.sectionHeader(doc, strategyLabels[key]);
        if (val.recommendation) doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(String(val.recommendation));
        if (val.reason) doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Reason: ${val.reason}`, { lineGap: 2 });
        if (val.priority) doc.fillColor('#64748b').fontSize(10).text(`Priority: ${val.priority}`, { lineGap: 2 });
        if (val.expectedImpact) doc.fillColor('#64748b').fontSize(10).text(`Expected Impact: ${val.expectedImpact}`, { lineGap: 2 });
        if (val.implementationNotes) doc.fillColor('#64748b').fontSize(10).text(`Implementation: ${val.implementationNotes}`, { lineGap: 2 });
        doc.moveDown(0.8);
      }

      // ── Execution weeks ──────────────────────────────────────
      // Custom decision reports (scenario comparisons and strategy challenges)
      if (content.question || content.recommendation) {
        this.sectionHeader(doc, 'Decision Comparison');
        if (content.question) doc.fillColor('#334155').fontSize(11).font('Helvetica')
          .text('Question: ' + String(content.question), { lineGap: 3 });
        if (content.recommendation) doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
          .text('Recommendation: ' + String(content.recommendation), { lineGap: 3 });
        const scenarios = content.scenarios as Array<Record<string, unknown>> | undefined;
        for (const scenario of scenarios || []) {
          const score = scenario.score !== undefined ? ' — ' + String(scenario.score) + '/100' : '';
          doc.moveDown(0.35).fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
            .text(String(scenario.name || 'Scenario') + score);
          for (const [key, label] of [['marketOpportunity', 'Market opportunity'], ['competitionLevel', 'Competition'], ['revenuePotential', 'Revenue potential'], ['customerAcquisitionCost', 'CAC estimate'], ['timeToRevenue', 'Time to revenue']] as const) {
            if (scenario[key]) doc.fillColor('#64748b').fontSize(10).font('Helvetica')
              .text(label + ': ' + String(scenario[key]), { indent: 10, lineGap: 2 });
          }
        }
        doc.moveDown(0.8);
      }

      if (content.verdictSummary || content.strategyStatement) {
        this.sectionHeader(doc, 'Strategy Challenge');
        if (content.strategyStatement) doc.fillColor('#334155').fontSize(11).font('Helvetica')
          .text('Strategy: ' + String(content.strategyStatement), { lineGap: 3 });
        if (content.overallVerdict) doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
          .text('Verdict: ' + String(content.overallVerdict), { lineGap: 3 });
        if (content.verdictSummary) doc.fillColor('#64748b').fontSize(10).font('Helvetica')
          .text(String(content.verdictSummary), { lineGap: 3 });
        doc.moveDown(0.8);
      }

      const customArraySections: Record<string, string> = {
        keyFactors: 'Key Decision Factors',
        nextSteps: 'Next Steps',
        weakPoints: 'Weak Points',
        alternativesToConsider: 'Alternatives to Consider',
      };
      for (const [key, label] of Object.entries(customArraySections)) {
        const items = content[key];
        if (!Array.isArray(items) || !items.length) continue;
        this.sectionHeader(doc, label);
        for (const item of items) {
          const text = typeof item === 'string' ? item : String((item as Record<string, unknown>).hypothesis || (item as Record<string, unknown>).assumption || '');
          if (text) doc.fillColor('#334155').fontSize(10).font('Helvetica').text('• ' + text, { indent: 10, lineGap: 3 });
        }
        doc.moveDown(0.6);
      }

      const weeks = content.weeks as Array<{
        week: number;
        focus: string;
        tasks: Array<{ title: string; priority?: string }>;
      }> | undefined;

      if (weeks?.length) {
        this.sectionHeader(doc, 'Execution Roadmap');
        for (const w of weeks) {
          doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(`Week ${w.week}: ${w.focus}`);
          for (const task of w.tasks || []) {
            doc.fillColor('#334155').fontSize(10).font('Helvetica')
              .text(`  • ${task.title}${task.priority ? ` [${task.priority}]` : ''}`, { lineGap: 2 });
          }
          doc.moveDown(0.5);
        }
      }

      // ── Footer ───────────────────────────────────────────────
      doc.fontSize(9).fillColor('#94a3b8').font('Helvetica')
        .text(
          'Lumiqs AI — Confidential Business Report',
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 },
        );

      doc.end();
    });
  }

  private sectionHeader(doc: typeof PDFDocument, title: string) {
    doc.moveDown(0.3);
    doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text(title);
    doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2)
      .strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.moveDown(0.5);
  }
}
