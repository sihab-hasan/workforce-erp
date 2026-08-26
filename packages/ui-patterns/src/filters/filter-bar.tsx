import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { cn } from "@workforce-erp/ui";

export type FilterBarProps = React.ComponentProps<"div"> & {
  query?: string;
  onQueryChange?: (value: string) => void;
  searchPlaceholder?: string;
  primaryFilters?: React.ReactNode;
  secondaryFilters?: React.ReactNode;
  savedViews?: React.ReactNode;
  activeFilters?: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
};

export function FilterBar({
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
  primaryFilters,
  secondaryFilters,
  savedViews,
  activeFilters,
  onReset,
  hasActiveFilters,
  className,
  ...props
}: FilterBarProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {onQueryChange ? (
            <Input
              type="search"
              value={query ?? ""}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full sm:max-w-sm"
            />
          ) : null}
          {primaryFilters}
          {secondaryFilters}
          {hasActiveFilters && onReset ? (
            <Button size="sm" variant="ghost" onClick={onReset}>
              Reset
            </Button>
          ) : null}
        </div>
        {savedViews ? <div className="shrink-0">{savedViews}</div> : null}
      </div>
      {activeFilters}
    </div>
  );
}
