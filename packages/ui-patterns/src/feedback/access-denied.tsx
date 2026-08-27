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

export type AccessDeniedProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onBack?: () => void;
  action?: React.ReactNode;
};

export function AccessDenied({
  title = "Access restricted",
  description = "You don't have permission to view this content. Request access from an administrator if you believe this is unexpected.",
  onBack,
  action,
}: AccessDeniedProps) {
  return (
    <Empty className="min-h-[22rem] px-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span aria-hidden="true">⛔</span>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {onBack || action ? (
        <EmptyContent className="flex-row justify-center">
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              Go back
            </Button>
          ) : null}
          {action}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
