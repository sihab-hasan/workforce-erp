import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { cn } from "@workforce-erp/ui";

export type ReportHeaderProps = React.ComponentProps<"header"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  period?: React.ReactNode;
  generatedAt?: React.ReactNode;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  summary?: React.ReactNode;
};

export function ReportHeader({
  title,
  description,
  period,
  generatedAt,
  status,
  actions,
  summary,
  className,
  ...props
}: ReportHeaderProps) {
  return (
    <header className={cn("space-y-4", className)} {...props}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            {status ? <Badge variant="secondary">{status}</Badge> : null}
          </div>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {period || generatedAt ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {period ? <span>{period}</span> : null}
              {generatedAt ? <span>Generated {generatedAt}</span> : null}
            </div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {summary ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{summary}</div> : null}
    </header>
  );
}
