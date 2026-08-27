import * as React from "react";
import { cn } from "@workforce-erp/ui";
import { EntityStatus, type EntityStatusTone } from "../entity/entity-status";

export type WorkflowTimelineStep = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  status?: React.ReactNode;
  tone?: EntityStatusTone;
  timestamp?: React.ReactNode;
  meta?: React.ReactNode;
  current?: boolean;
};

export type WorkflowTimelineProps = React.ComponentProps<"ol"> & {
  steps: WorkflowTimelineStep[];
};

export function WorkflowTimeline({ steps, className, ...props }: WorkflowTimelineProps) {
  return (
    <ol className={cn("space-y-0", className)} {...props}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0"
        >
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute left-[0.72rem] top-5 bottom-0 w-px bg-border"
            />
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              "relative z-10 mt-1 size-3 rounded-full border-2 border-background ring-1 ring-border",
              step.current
                ? "bg-primary ring-primary/50"
                : step.tone === "success"
                  ? "bg-emerald-500"
                  : step.tone === "danger"
                    ? "bg-destructive"
                    : step.tone === "warning"
                      ? "bg-amber-500"
                      : "bg-muted-foreground/50",
            )}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className={cn("text-sm font-medium", step.current && "font-semibold")}>
                  {step.title}
                </span>
                {step.status ? (
                  <EntityStatus tone={step.tone ?? "neutral"}>{step.status}</EntityStatus>
                ) : null}
              </div>
              {step.timestamp ? (
                <span className="shrink-0 text-xs text-muted-foreground">{step.timestamp}</span>
              ) : null}
            </div>
            {step.description ? (
              <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </div>
            ) : null}
            {step.meta ? (
              <div className="mt-2 text-xs text-muted-foreground">{step.meta}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
