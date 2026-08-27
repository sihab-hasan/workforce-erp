import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workforce-erp/ui/components/avatar";
import { Badge } from "@workforce-erp/ui/components/badge";
import { cn } from "@workforce-erp/ui";

export type ActivityActor = {
  name: string;
  avatarUrl?: string;
  initials?: string;
};

export type ActivityItemProps = React.ComponentProps<"article"> & {
  actor?: ActivityActor;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: React.ReactNode;
  badge?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  isLast?: boolean;
};

export function ActivityItem({
  actor,
  icon,
  title,
  description,
  timestamp,
  badge,
  metadata,
  actions,
  isLast,
  className,
  ...props
}: ActivityItemProps) {
  const initials =
    actor?.initials ??
    actor?.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  return (
    <article
      className={cn("relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3", className)}
      {...props}
    >
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-[1.1rem] top-9 bottom-[-1rem] w-px bg-border"
        />
      ) : null}
      <div className="relative z-10 flex size-9 items-center justify-center rounded-full border bg-background text-xs font-semibold text-muted-foreground shadow-sm">
        {actor ? (
          <Avatar className="size-9">
            {actor.avatarUrl ? <AvatarImage src={actor.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ) : (
          (icon ?? <span aria-hidden="true">•</span>)
        )}
      </div>
      <div className="min-w-0 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0 text-sm leading-5">
            {actor ? <span className="font-semibold text-foreground">{actor.name} </span> : null}
            <span className="text-foreground">{title}</span>
            {badge ? (
              <Badge variant="secondary" className="ml-2 align-middle">
                {badge}
              </Badge>
            ) : null}
          </div>
          {timestamp ? (
            <time className="shrink-0 text-xs text-muted-foreground">{timestamp}</time>
          ) : null}
        </div>
        {description ? (
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</div>
        ) : null}
        {metadata ? (
          <div className="mt-2 rounded-xl border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            {metadata}
          </div>
        ) : null}
        {actions ? <div className="mt-2 flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </article>
  );
}
