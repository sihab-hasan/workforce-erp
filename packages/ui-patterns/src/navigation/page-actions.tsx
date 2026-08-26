import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type PageActionsProps = React.ComponentProps<"div"> & {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  overflow?: React.ReactNode;
};

export function PageActions({
  primary,
  secondary,
  overflow,
  className,
  children,
  ...props
}: PageActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {secondary}
      {children}
      {overflow}
      {primary}
    </div>
  );
}
