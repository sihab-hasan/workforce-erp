import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workforce-erp/ui/components/avatar";
import { cn } from "@workforce-erp/ui";

export type EntityHeaderProps = React.ComponentProps<"header"> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  identifier?: React.ReactNode;
  status?: React.ReactNode;
  avatar?: { src?: string; alt?: string; fallback?: React.ReactNode };
  icon?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
};

export function EntityHeader({
  title,
  subtitle,
  identifier,
  status,
  avatar,
  icon,
  metadata,
  actions,
  breadcrumbs,
  className,
  ...props
}: EntityHeaderProps) {
  return (
    <header className={cn("space-y-4", className)} {...props}>
      {breadcrumbs}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {avatar ? (
            <Avatar className="size-12 shrink-0 rounded-2xl">
              {avatar.src ? <AvatarImage src={avatar.src} alt={avatar.alt ?? ""} /> : null}
              <AvatarFallback className="rounded-2xl">{avatar.fallback ?? "—"}</AvatarFallback>
            </Avatar>
          ) : icon ? (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-card text-muted-foreground shadow-sm">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                {title}
              </h1>
              {status}
            </div>
            {subtitle || identifier ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {subtitle}
                {identifier ? <span className="font-mono text-xs">{identifier}</span> : null}
              </div>
            ) : null}
            {metadata ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {metadata}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}
