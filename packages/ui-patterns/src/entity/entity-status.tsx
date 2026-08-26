import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { cn } from "@workforce-erp/ui";

export type EntityStatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export type EntityStatusProps = React.ComponentProps<typeof Badge> & {
  tone?: EntityStatusTone;
  dot?: boolean;
};

const toneClasses: Record<EntityStatusTone, string> = {
  neutral: "border-border bg-muted text-foreground",
  info: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
};

const dotClasses: Record<EntityStatusTone, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
};

export function EntityStatus({
  tone = "neutral",
  dot = true,
  className,
  children,
  ...props
}: EntityStatusProps) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-full px-2.5", toneClasses[tone], className)}
      {...props}
    >
      {dot ? (
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotClasses[tone])} />
      ) : null}
      {children}
    </Badge>
  );
}
