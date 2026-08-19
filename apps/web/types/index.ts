export type BusinessStage = "IDEA" | "PRE_LAUNCH" | "MVP" | "EARLY_REVENUE" | "GROWTH" | "ESTABLISHED";
export type ReportType = "BUSINESS_ANALYSIS" | "MARKET_RESEARCH" | "COMPETITOR_ANALYSIS" | "STRATEGY" | "EXECUTION" | "CUSTOM";
export type ReportStatus = "GENERATING" | "COMPLETED" | "FAILED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type MessageRole = "user" | "assistant" | "system";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Business {
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

export interface Conversation {
  id: string;
  businessId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: { messages: number };
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Report {
  id: string;
  businessId: string;
  userId: string;
  type: ReportType;
  status: ReportStatus;
  title: string;
  summary?: string;
  content?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  businessId: string;
  userId: string;
  title: string;
  content: string;
  source?: string;
  tags: string[];
  createdAt: string;
}

export interface BusinessMemory {
  id: string;
  businessId: string;
  type: string;
  content: string;
  importance: number;
  isActive: boolean;
  createdAt: string;
}

export interface ExecutionTask {
  id: string;
  reportId: string;
  businessId: string;
  title: string;
  description?: string;
  week?: number;
  priority: string;
  status: TaskStatus;
  outcome?: string;
}

export interface Competitor {
  id: string;
  businessId: string;
  name: string;
  website?: string;
  analysis?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardData {
  businesses: Business[];
  recentReports: (Report & { business: { name: string } })[];
  recentConversations: (Conversation & { business: { name: string } })[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}
