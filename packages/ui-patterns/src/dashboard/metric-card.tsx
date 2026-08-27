import * as React from "react";
import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { Progress } from "@workforce-erp/ui/components/progress";
import { cn } from "@workforce-erp/ui";

export type MetricCardProps = React.ComponentProps<typeof Card> & {
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  progress?: number;
  target?: React.ReactNode;
  icon?: React.ReactNode;
};

export function MetricCard({
  label,
  value,
  detail,
  progress,
  target,
  icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("min-w-0", className)} {...props}>
      <CardContent className="flex items-start gap-4 py-4">
        {icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <div className="mt-1 font-heading text-xl font-semibold tracking-tight tabular-nums">
                {value}
              </div>
            </div>
            {target ? <div className="text-xs text-muted-foreground">{target}</div> : null}
          </div>
          {typeof progress === "number" ? (
            <Progress
              value={Math.max(0, Math.min(100, progress))}
              className="mt-3 [&_[data-slot=progress-track]]:h-1.5"
            />
          ) : null}
          {detail ? (
            <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
