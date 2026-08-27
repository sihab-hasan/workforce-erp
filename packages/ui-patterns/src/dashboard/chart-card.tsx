import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { cn } from "@workforce-erp/ui";

export type ChartCardProps = React.ComponentProps<typeof Card> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  trend?: React.ReactNode;
  controls?: React.ReactNode;
  legend?: React.ReactNode;
  loading?: boolean;
  chartClassName?: string;
};

export function ChartCard({
  title,
  description,
  value,
  trend,
  controls,
  legend,
  loading = false,
  chartClassName,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)} {...props}>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="font-heading text-base">{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
            {value || trend ? (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <span className="font-heading text-2xl font-semibold tabular-nums">{value}</span>
                {trend ? (
                  <span className="mb-0.5 text-xs text-muted-foreground">{trend}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          {controls ? <div className="shrink-0">{controls}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {loading ? (
          <Skeleton className={cn("h-64 w-full rounded-xl", chartClassName)} />
        ) : (
          <div className={cn("min-h-64 w-full", chartClassName)}>{children}</div>
        )}
        {legend ? (
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-3 text-xs text-muted-foreground">
            {legend}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
