import { z } from 'zod';
import { BusinessStage } from '@lumiqs/types';

// ─────────────────────────────────────────────
// BUSINESS
// ─────────────────────────────────────────────

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().max(100).optional(),
  stage: z.nativeEnum(BusinessStage).optional(),
  country: z.string().max(100).optional(),
  teamSize: z.string().max(50).optional(),
  revenueModel: z.string().max(200).optional(),
  targetAudience: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  goals: z.string().max(2000).optional(),
  challenges: z.string().max(2000).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000),
  conversationId: z.string().cuid().optional(),
});

// ─────────────────────────────────────────────
// INSIGHT
// ─────────────────────────────────────────────

export const createInsightSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  source: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// ─────────────────────────────────────────────
// COMPETITOR
// ─────────────────────────────────────────────

export const analyzeCompetitorSchema = z.object({
  competitorName: z.string().min(1).max(200),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────

export const createReportSchema = z.object({
  type: z.enum(['BUSINESS_ANALYSIS', 'MARKET_RESEARCH', 'COMPETITOR_ANALYSIS', 'STRATEGY', 'EXECUTION_PLAN', 'CUSTOM']),
  title: z.string().min(1).max(200).optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type CreateInsightInput = z.infer<typeof createInsightSchema>;
export type AnalyzeCompetitorInput = z.infer<typeof analyzeCompetitorSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
