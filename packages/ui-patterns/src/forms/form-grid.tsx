import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type FormGridProps = React.ComponentProps<"div"> & {
  columns?: 1 | 2 | 3 | 4;
  dense?: boolean;
};

const columnClasses: Record<NonNullable<FormGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

export function FormGrid({ columns = 2, dense = false, className, ...props }: FormGridProps) {
  return (
    <div
      className={cn("grid", dense ? "gap-3" : "gap-x-5 gap-y-4", columnClasses[columns], className)}
      {...props}
    />
  );
}
