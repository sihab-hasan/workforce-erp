import * as React from "react";
import { Card } from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui";
import { ErrorState } from "../feedback/error-state";
import { LoadingState } from "../feedback/loading-state";
import { EmptyState } from "../feedback/empty-state";

export type ReportViewerProps = React.ComponentProps<typeof Card> & {
  loading?: boolean;
  error?: React.ReactNode;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean;
};

export function ReportViewer({
  loading,
  error,
  empty,
  emptyTitle = "No report data",
  emptyDescription = "Adjust the report parameters and run the report again.",
  toolbar,
  footer,
  flush = true,
  className,
  children,
  ...props
}: ReportViewerProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)} {...props}>
      {toolbar ? <div className="border-b px-4 py-3">{toolbar}</div> : null}
      <div className={cn("min-h-72", !flush && "p-5")}>
        {loading ? (
          <LoadingState variant="skeleton" className="border-0" />
        ) : error ? (
          <ErrorState title="Unable to load report" description={error} className="border-0" />
        ) : empty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} className="border-0" />
        ) : (
          children
        )}
      </div>
      {footer ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">{footer}</div>
      ) : null}
    </Card>
  );
}
