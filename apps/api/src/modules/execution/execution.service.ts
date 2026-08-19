import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus } from '../reports/report.schema';
import { ExecutionTask, ExecutionTaskDocument, TaskStatus } from './execution.schema';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

const EXECUTION_PROMPT = `You are a senior business execution consultant. Create a detailed, actionable execution plan.
Every task must be specific, measurable, and achievable. Assign realistic weeks and priorities.

Return JSON with this exact structure:
{
  "executiveSummary": "string",
  "monthlyGoals": ["string"],
  "milestones": [
    { "title": "string", "description": "string", "targetDate": "string", "successMetric": "string" }
  ],
  "weeks": [
    {
      "week": 1,
      "focus": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "priority": "HIGH|MEDIUM|LOW",
          "outcome": "string",
          "dependencies": ["string"]
        }
      ]
    }
  ],
  "successMetrics": ["string"],
  "risks": ["string"]
}`;

@Injectable()
export class ExecutionService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    @InjectModel(ExecutionTask.name) private readonly taskModel: Model<ExecutionTaskDocument>,
    private readonly orchestrator: AIOrchestrator,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async generate(businessId: string, userId: string, userPlan: UserPlan) {
    await this.planLimits.checkReportLimit(userId, userPlan);
    const report = await this.reportModel.create({
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      type: ReportType.EXECUTION,
      status: ReportStatus.GENERATING,
      title: 'Execution Plan',
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        EXECUTION_PROMPT,
        'Create a detailed 4-week execution plan with specific tasks, priorities, and success metrics.',
      ) as Record<string, unknown>;

      const weeks = (content.weeks as Array<{
        week: number;
        tasks: Array<{ title: string; description?: string; priority?: string; outcome?: string }>;
      }>) || [];

      for (const weekData of weeks) {
        for (const task of weekData.tasks || []) {
          await this.taskModel.create({
            executionPlanId: report._id,
            businessId: new Types.ObjectId(businessId),
            title: task.title,
            description: task.description,
            week: weekData.week,
            priority: task.priority || 'MEDIUM',
            expectedOutcome: task.outcome,
            status: TaskStatus.TODO,
          });
        }
      }

      return this.reportModel.findByIdAndUpdate(
        report._id,
        {
          $set: {
            status: ReportStatus.COMPLETED,
            content,
            summary: (content.executiveSummary as string) || '',
          },
        },
        { new: true },
      ).lean();
    } catch (error) {
      await this.reportModel.findByIdAndUpdate(report._id, { $set: { status: ReportStatus.FAILED } });
      throw error;
    }
  }

  async getTasks(reportId: string, businessId: string) {
    return this.taskModel
      .find({
        executionPlanId: new Types.ObjectId(reportId),
        businessId: new Types.ObjectId(businessId),
      })
      .sort({ week: 1, priority: 1 })
      .lean();
  }

  async updateTaskStatus(taskId: string, businessId: string, status: TaskStatus) {
    return this.taskModel.findOneAndUpdate(
      { _id: new Types.ObjectId(taskId), businessId: new Types.ObjectId(businessId) },
      { $set: { status } },
      { new: true },
    ).lean();
  }
}
