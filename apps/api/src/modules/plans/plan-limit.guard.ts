import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanLimitsService } from './plan-limits.service';
import { UserPlan } from '../users/user.schema';

export const PLAN_REQUIREMENT_KEY = 'planRequirement';

export type PlanCapability =
  | 'marketResearch'
  | 'competitors'
  | 'strategy'
  | 'execution'
  | 'pdfExport';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly planLimits: PlanLimitsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requirement = this.reflector.getAllAndOverride<PlanCapability>(
      PLAN_REQUIREMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No requirement set — allow freely
    if (!requirement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const plan = (user?.plan ?? UserPlan.EXPLORER) as UserPlan;
    const limits = this.planLimits.getLimits(plan);

    const capabilityMap: Record<PlanCapability, keyof typeof limits> = {
      marketResearch: 'canAccessMarketResearch',
      competitors: 'canAccessCompetitors',
      strategy: 'canAccessStrategy',
      execution: 'canAccessExecution',
      pdfExport: 'canExportPdf',
    };

    const limitKey = capabilityMap[requirement];
    const allowed = limits[limitKey];

    if (!allowed) {
      throw new ForbiddenException(
        `Your ${plan} plan does not include ${this.featureName(requirement)}. Upgrade to unlock this feature.`,
      );
    }

    return true;
  }

  private featureName(capability: PlanCapability): string {
    const names: Record<PlanCapability, string> = {
      marketResearch: 'Market Research',
      competitors: 'Competitor Analysis',
      strategy: 'Strategy Planning',
      execution: 'Execution Planning',
      pdfExport: 'PDF Export',
    };
    return names[capability];
  }
}

export const SetPlanRequirement = (capability: PlanCapability) =>
  SetMetadata(PLAN_REQUIREMENT_KEY, capability);
