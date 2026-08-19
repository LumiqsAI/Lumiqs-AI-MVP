import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[.99]";
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm btn-glow",
      outline: "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--page-fg)] text-sm transition-colors hover:border-indigo-400/60 hover:text-indigo-500",
      ghost: "text-[var(--muted-fg)] hover:bg-indigo-500/8 hover:text-indigo-500",
      destructive: "bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30",
      secondary: "bg-[var(--surface-raised)] text-[var(--page-fg)] text-sm transition-colors hover:bg-indigo-500/10",
    };
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
