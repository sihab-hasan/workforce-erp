import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";
import { cn } from "@workforce-erp/ui";

export type ErrorStateProps = React.ComponentProps<typeof Empty> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  errorCode?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't complete this request. Try again or contact support if the problem continues.",
  errorCode,
  onRetry,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <Empty className={cn("min-h-72 rounded-2xl border bg-card px-6", className)} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span className="text-destructive" aria-hidden="true">
            !
          </span>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
        {errorCode ? (
          <code className="mt-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
            {errorCode}
          </code>
        ) : null}
      </EmptyHeader>
      {onRetry || action ? (
        <EmptyContent className="flex-row justify-center">
          {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
          {action}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
