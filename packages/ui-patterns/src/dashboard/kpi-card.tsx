import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Card, CardContent, CardHeader } from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui";

export type KpiCardProps = React.ComponentProps<typeof Card> & {
  label: React.ReactNode;
  value: React.ReactNode;
  supportingText?: React.ReactNode;
  trend?: { value: React.ReactNode; direction?: "up" | "down" | "neutral"; label?: string };
  icon?: React.ReactNode;
  footer?: React.ReactNode;
};

export function KpiCard({
  label,
  value,
  supportingText,
  trend,
  icon,
  footer,
  className,
  ...props
}: KpiCardProps) {
  return (
    <Card className={cn("min-w-0", className)} {...props}>
      <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0 text-sm font-medium text-muted-foreground">{label}</div>
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <div className="font-heading text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
            {value}
          </div>
          {trend ? (
            <Badge
              variant={
                trend.direction === "down"
                  ? "destructive"
                  : trend.direction === "neutral"
                    ? "secondary"
                    : "outline"
              }
              className="mb-1"
            >
              <span aria-hidden="true">
                {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
              </span>
              {trend.value}
            </Badge>
          ) : null}
        </div>
        {supportingText || trend?.label ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {supportingText ?? trend?.label}
          </p>
        ) : null}
        {footer ? <div className="border-t pt-3">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
