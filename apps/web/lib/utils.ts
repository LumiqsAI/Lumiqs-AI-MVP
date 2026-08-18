import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export const STAGE_LABELS: Record<string, string> = {
  IDEA: "Idea",
  PRE_LAUNCH: "Pre-Launch",
  MVP: "MVP",
  EARLY_REVENUE: "Early Revenue",
  GROWTH: "Growth",
  ESTABLISHED: "Established",
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  BUSINESS_ANALYSIS: "Business Analysis",
  MARKET_RESEARCH: "Market Research",
  COMPETITOR_ANALYSIS: "Competitor Analysis",
  STRATEGY: "Strategy",
  EXECUTION_PLAN: "Execution Plan",
  CUSTOM: "Custom",
};

export const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-400 bg-red-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  LOW: "text-emerald-400 bg-emerald-400/10",
};
