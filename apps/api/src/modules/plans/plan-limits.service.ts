import { Injectable } from '@nestjs/common';
import { UserPlan } from '../users/user.schema';

export interface PlanLimits {
  maxBusinesses: number;          // -1 = unlimited
  maxAiMessagesPerMonth: number;
  maxInsightsPerBusiness: number;
  maxReportsPerMonth: number;
  canExportPdf: boolean;
  canAccessMarketResearch: boolean;
  canAccessCompetitors: boolean;
  canAccessStrategy: boolean;
  canAccessExecution: boolean;
}

const LIMITS: Record<UserPlan, PlanLimits> = {
  [UserPlan.EXPLORER]: {
    maxBusinesses: 1,
    maxAiMessagesPerMonth: 20,
    maxInsightsPerBusiness: 10,
    maxReportsPerMonth: 2,
    canExportPdf: false,
    canAccessMarketResearch: false,
    canAccessCompetitors: false,
    canAccessStrategy: false,
    canAccessExecution: false,
  },
  [UserPlan.FOUNDER]: {
    maxBusinesses: 3,
    maxAiMessagesPerMonth: 200,
    maxInsightsPerBusiness: 100,
    maxReportsPerMonth: 20,
    canExportPdf: false,
    canAccessMarketResearch: true,
    canAccessCompetitors: true,
    canAccessStrategy: true,
    canAccessExecution: true,
  },
  [UserPlan.STUDIO]: {
    maxBusinesses: -1,
    maxAiMessagesPerMonth: 1000,
    maxInsightsPerBusiness: -1,
    maxReportsPerMonth: 100,
    canExportPdf: true,
    canAccessMarketResearch: true,
    canAccessCompetitors: true,
    canAccessStrategy: true,
    canAccessExecution: true,
  },
  [UserPlan.CUSTOM]: {
    maxBusinesses: -1,
    maxAiMessagesPerMonth: -1,
    maxInsightsPerBusiness: -1,
    maxReportsPerMonth: -1,
    canExportPdf: true,
    canAccessMarketResearch: true,
    canAccessCompetitors: true,
    canAccessStrategy: true,
    canAccessExecution: true,
  },
};

@Injectable()
export class PlanLimitsService {
  getLimits(plan: UserPlan): PlanLimits {
    return LIMITS[plan] ?? LIMITS[UserPlan.EXPLORER];
  }

  isUnlimited(value: number): boolean {
    return value === -1;
  }
}
