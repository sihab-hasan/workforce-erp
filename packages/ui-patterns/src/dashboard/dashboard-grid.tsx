import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type DashboardGridProps = React.ComponentProps<"div"> & {
  columns?: 1 | 2 | 3 | 4;
  dense?: boolean;
};

const grids = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function DashboardGrid({
  columns = 4,
  dense = false,
  className,
  ...props
}: DashboardGridProps) {
  return (
    <div className={cn("grid", grids[columns], dense ? "gap-3" : "gap-4", className)} {...props} />
  );
}
