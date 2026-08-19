import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl transition-[border-color,box-shadow] duration-200", className)}
      style={{
        border: "1px solid var(--card-border)",
        background: "var(--card-bg)",
        boxShadow: "var(--card-shadow)",
        ...style,
      }}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pb-0", className)} {...props} />
);

export const CardTitle = ({ className, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-base font-semibold tracking-tight", className)}
    style={{ color: "var(--page-fg)", letterSpacing: "-0.015em", ...style }}
    {...props}
  />
);

export const CardDescription = ({ className, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm mt-1", className)} style={{ color: "var(--muted-fg)", ...style }} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-5 pb-5 flex items-center gap-2", className)} {...props} />
);
