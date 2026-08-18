import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIOrchestrator } from '../ai/services/ai-orchestrator.service';
import { ReportType, ReportStatus, TaskStatus } from '@prisma/client';

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
    private readonly prisma: PrismaService,
    private readonly orchestrator: AIOrchestrator,
  ) {}

  async generate(businessId: string, userId: string) {
    const report = await this.prisma.report.create({
      data: {
        businessId,
        userId,
        type: ReportType.EXECUTION_PLAN,
        status: ReportStatus.GENERATING,
        title: 'Execution Plan',
      },
    });

    try {
      const content = await this.orchestrator.generateStructured(
        businessId,
        EXECUTION_PROMPT,
        'Create a detailed 4-week execution plan with specific tasks, priorities, and success metrics.',
      ) as Record<string, unknown>;

      // Persist tasks to ExecutionTask table
      const weeks = (content.weeks as Array<{ week: number; tasks: Array<{ title: string; description?: string; priority?: string; outcome?: string }> }>) || [];
      for (const weekData of weeks) {
        for (const task of weekData.tasks || []) {
          await this.prisma.executionTask.create({
            data: {
              reportId: report.id,
              businessId,
              title: task.title,
              description: task.description,
              week: weekData.week,
              priority: task.priority || 'MEDIUM',
              outcome: task.outcome,
              status: TaskStatus.TODO,
            },
          });
        }
      }

      return this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.COMPLETED,
          content: content as object,
          summary: (content.executiveSummary as string) || '',
        },
      });
    } catch (error) {
      await this.prisma.report.update({ where: { id: report.id }, data: { status: ReportStatus.FAILED } });
      throw error;
    }
  }

  async getTasks(reportId: string, businessId: string) {
    return this.prisma.executionTask.findMany({
      where: { reportId, businessId },
      orderBy: [{ week: 'asc' }, { priority: 'asc' }],
    });
  }

  async updateTaskStatus(taskId: string, businessId: string, status: TaskStatus) {
    return this.prisma.executionTask.updateMany({
      where: { id: taskId, businessId },
      data: { status },
    });
  }
}
