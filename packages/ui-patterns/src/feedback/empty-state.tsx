import * as React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";
import { cn } from "@workforce-erp/ui";

export type EmptyStateProps = React.ComponentProps<typeof Empty> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Empty
      className={cn("min-h-72 rounded-2xl border border-dashed bg-muted/15 px-6", className)}
      {...props}
    >
      <EmptyHeader>
        {illustration ? (
          <EmptyMedia>{illustration}</EmptyMedia>
        ) : icon ? (
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {primaryAction || secondaryAction ? (
        <EmptyContent className="flex-row flex-wrap justify-center">
          {secondaryAction}
          {primaryAction}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
