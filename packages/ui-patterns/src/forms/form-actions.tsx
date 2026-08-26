import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui";

export type FormActionsProps = React.ComponentProps<"div"> & {
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  loading?: boolean;
  destructive?: React.ReactNode;
  children?: React.ReactNode;
  sticky?: boolean;
};

export function FormActions({
  primaryLabel = "Save changes",
  secondaryLabel = "Cancel",
  onPrimary,
  onSecondary,
  primaryDisabled,
  loading,
  destructive,
  children,
  sticky = false,
  className,
  ...props
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t bg-background/95 py-4 sm:flex-row sm:items-center sm:justify-between",
        sticky && "sticky bottom-0 z-20 -mx-4 px-4 backdrop-blur md:-mx-6 md:px-6",
        className,
      )}
      {...props}
    >
      <div>{destructive}</div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {children}
        {onSecondary ? (
          <Button type="button" variant="outline" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        ) : null}
        {onPrimary ? (
          <Button type="button" onClick={onPrimary} disabled={primaryDisabled || loading}>
            {loading ? "Saving…" : primaryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
