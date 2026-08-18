// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export enum BusinessStage {
  IDEA = 'IDEA',
  PRE_LAUNCH = 'PRE_LAUNCH',
  MVP = 'MVP',
  EARLY_REVENUE = 'EARLY_REVENUE',
  GROWTH = 'GROWTH',
  ESTABLISHED = 'ESTABLISHED',
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export enum ReportType {
  BUSINESS_ANALYSIS = 'BUSINESS_ANALYSIS',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  COMPETITOR_ANALYSIS = 'COMPETITOR_ANALYSIS',
  STRATEGY = 'STRATEGY',
  EXECUTION_PLAN = 'EXECUTION_PLAN',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum MemoryType {
  BUSINESS_FACT = 'BUSINESS_FACT',
  USER_PREFERENCE = 'USER_PREFERENCE',
  DECISION = 'DECISION',
  RECOMMENDATION = 'RECOMMENDATION',
  STRATEGIC_CONCLUSION = 'STRATEGIC_CONCLUSION',
  CUSTOMER_INSIGHT = 'CUSTOMER_INSIGHT',
}

// ─────────────────────────────────────────────
// API RESPONSE
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export interface UserDto {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// BUSINESS
// ─────────────────────────────────────────────

export interface BusinessDto {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  stage: BusinessStage;
  country?: string;
  teamSize?: string;
  revenueModel?: string;
  targetAudience?: string;
  description?: string;
  goals?: string;
  challenges?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessDto {
  name: string;
  website?: string;
  industry?: string;
  stage?: BusinessStage;
  country?: string;
  teamSize?: string;
  revenueModel?: string;
  targetAudience?: string;
  description?: string;
  goals?: string;
  challenges?: string;
}

export interface UpdateBusinessDto extends Partial<CreateBusinessDto> {}

// ─────────────────────────────────────────────
// CONVERSATION
// ─────────────────────────────────────────────

export interface ConversationDto {
  id: string;
  businessId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: MessageDto[];
}

export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// AI CHAT
// ─────────────────────────────────────────────

export interface ChatRequestDto {
  message: string;
  conversationId?: string;
}

export interface ChatResponseDto {
  conversationId: string;
  messageId: string;
  content: string;
  role: MessageRole;
}

// ─────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────

export interface ReportDto {
  id: string;
  businessId: string;
  userId: string;
  type: ReportType;
  status: ReportStatus;
  title: string;
  summary?: string;
  content?: Record<string, unknown>;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// INSIGHT
// ─────────────────────────────────────────────

export interface InsightDto {
  id: string;
  businessId: string;
  userId: string;
  title: string;
  content: string;
  source?: string;
  tags: string[];
  createdAt: string;
}

export interface CreateInsightDto {
  title: string;
  content: string;
  source?: string;
  tags?: string[];
}

// ─────────────────────────────────────────────
// BUSINESS MEMORY
// ─────────────────────────────────────────────

export interface BusinessMemoryDto {
  id: string;
  businessId: string;
  type: MemoryType;
  content: string;
  importance: number;
  createdAt: string;
}

// ─────────────────────────────────────────────
// COMPETITOR
// ─────────────────────────────────────────────

export interface CompetitorDto {
  id: string;
  businessId: string;
  name: string;
  website?: string;
  analysis?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeCompetitorDto {
  competitorName: string;
  website?: string;
}

// ─────────────────────────────────────────────
// AI ANALYSIS CONTENT TYPES
// ─────────────────────────────────────────────

export interface BusinessAnalysisContent {
  executiveSummary: string;
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  recommendations: StrategyRecommendation[];
  priorityActions: string[];
}

export interface MarketResearchContent {
  industryOverview: string;
  marketSize: string;
  marketGrowth: string;
  customerPersonas: CustomerPersona[];
  painPoints: string[];
  trends: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

export interface CustomerPersona {
  name: string;
  description: string;
  painPoints: string[];
  goals: string[];
}

export interface CompetitorAnalysisContent {
  overview: string;
  businessModel: string;
  targetAudience: string;
  pricing: string;
  features: string[];
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitiveAdvantages: string[];
  threats: string[];
}

export interface StrategyContent {
  revenueStrategy: StrategyRecommendation;
  pricingStrategy: StrategyRecommendation;
  marketingStrategy: StrategyRecommendation;
  salesStrategy: StrategyRecommendation;
  growthStrategy: StrategyRecommendation;
}

export interface StrategyRecommendation {
  recommendation: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedImpact: string;
  implementationNotes: string;
}

export interface ExecutionPlanContent {
  weeklyRoadmap: WeeklyPlan[];
  monthlyGoals: string[];
  milestones: Milestone[];
  priorities: string[];
  successMetrics: string[];
}

export interface WeeklyPlan {
  week: number;
  tasks: ExecutionTask[];
}

export interface ExecutionTask {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  outcome: string;
  status: TaskStatus;
}

export interface Milestone {
  title: string;
  description: string;
  timeline: string;
  dependencies: string[];
}
