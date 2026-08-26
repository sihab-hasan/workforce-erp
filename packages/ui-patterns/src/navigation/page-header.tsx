import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type PageHeaderProps = React.ComponentProps<"header"> & {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: React.ReactNode;
  tabs?: React.ReactNode;
  compact?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  metadata,
  tabs,
  compact = false,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4", !compact && "pb-1", className)} {...props}>
      {breadcrumbs}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-4xl">
          {eyebrow ? (
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {eyebrow}
            </div>
          ) : null}
          <h1
            className={cn(
              "font-heading font-semibold tracking-tight text-balance",
              compact ? "text-2xl" : "text-2xl md:text-3xl",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[0.925rem]">
              {description}
            </p>
          ) : null}
          {metadata ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {metadata}
            </div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {tabs ? <div className="pt-1">{tabs}</div> : null}
    </header>
  );
}
