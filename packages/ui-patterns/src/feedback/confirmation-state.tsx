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

export type ConfirmationStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  reference?: React.ReactNode;
  primaryAction?: React.ReactNode;
  onDone?: () => void;
};

export function ConfirmationState({
  title,
  description,
  reference,
  primaryAction,
  onDone,
}: ConfirmationStateProps) {
  return (
    <Empty className="min-h-[22rem] px-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span className="text-primary" aria-hidden="true">
            ✓
          </span>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
        {reference ? (
          <div className="mt-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium">{reference}</div>
        ) : null}
      </EmptyHeader>
      {primaryAction || onDone ? (
        <EmptyContent>{primaryAction ?? <Button onClick={onDone}>Done</Button>}</EmptyContent>
      ) : null}
    </Empty>
  );
}
