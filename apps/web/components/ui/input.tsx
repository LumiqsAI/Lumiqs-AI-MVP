import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg px-3.5 py-2 text-sm transition-all duration-150",
        "placeholder:text-[var(--subtle-fg)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 focus:border-[var(--accent)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      style={{
        border: "1px solid var(--line-strong)",
        background: "var(--surface-raised)",
        color: "var(--page-fg)",
      }}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150",
        "placeholder:text-[var(--subtle-fg)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 focus:border-[var(--accent)]",
        "disabled:opacity-50 disabled:cursor-not-allowed resize-none",
        className,
      )}
      style={{
        border: "1px solid var(--line-strong)",
        background: "var(--surface-raised)",
        color: "var(--page-fg)",
      }}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
