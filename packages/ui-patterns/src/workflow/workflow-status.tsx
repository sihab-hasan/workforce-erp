import * as React from "react";
import { Progress } from "@workforce-erp/ui/components/progress";
import { cn } from "@workforce-erp/ui";
import { EntityStatus, type EntityStatusTone } from "../entity/entity-status";

export type WorkflowStatusProps = React.ComponentProps<"div"> & {
  label: React.ReactNode;
  tone?: EntityStatusTone;
  description?: React.ReactNode;
  progress?: number;
  stepLabel?: React.ReactNode;
};

export function WorkflowStatus({
  label,
  tone = "neutral",
  description,
  progress,
  stepLabel,
  className,
  ...props
}: WorkflowStatusProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <EntityStatus tone={tone}>{label}</EntityStatus>
        {stepLabel ? <span className="text-xs text-muted-foreground">{stepLabel}</span> : null}
      </div>
      {typeof progress === "number" ? (
        <Progress
          value={Math.max(0, Math.min(100, progress))}
          className="[&_[data-slot=progress-track]]:h-1.5"
        />
      ) : null}
      {description ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
