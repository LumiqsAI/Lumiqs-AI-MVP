import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium";

  const styles: Record<string, React.CSSProperties> = {
    default: { background: "var(--surface-raised)", color: "var(--muted-fg)", border: "1px solid var(--line)" },
    success: { background: "rgba(16, 185, 129, 0.08)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.15)" },
    warning: { background: "rgba(245, 158, 11, 0.08)", color: "#D97706", border: "1px solid rgba(245, 158, 11, 0.15)" },
    danger:  { background: "rgba(239, 68, 68, 0.08)",  color: "#DC2626", border: "1px solid rgba(239, 68, 68, 0.15)" },
    info:    { background: "var(--badge-bg)", color: "var(--badge-fg)", border: "1px solid var(--accent-glow)" },
  };

  return (
    <span className={cn(base, className)} style={styles[variant]}>
      {children}
    </span>
  );
}
