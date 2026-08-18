"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps { className?: string; size?: "sm" | "md" | "lg" }

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <svg className={cn("animate-spin text-indigo-400", sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && <div className="text-slate-600">{icon}</div>}
      <div>
        <p className="text-white font-medium">{title}</p>
        {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
