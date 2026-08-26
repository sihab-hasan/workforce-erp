import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { cn } from "@workforce-erp/ui";

export type DataTableToolbarProps = React.ComponentProps<"div"> & {
  query?: string;
  onQueryChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  columnToggle?: React.ReactNode;
  actions?: React.ReactNode;
  selectedCount?: number;
  bulkActions?: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
};

export function DataTableToolbar({
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
  filters,
  columnToggle,
  actions,
  selectedCount = 0,
  bulkActions,
  onReset,
  hasActiveFilters,
  className,
  ...props
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {onQueryChange ? (
          <Input
            type="search"
            value={query ?? ""}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder.replace(/…|\.\.\./g, "")}
            className="w-full md:max-w-xs"
          />
        ) : null}
        {filters}
        {hasActiveFilters && onReset ? (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {selectedCount > 0 ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {selectedCount} selected
          </span>
        ) : null}
        {selectedCount > 0 ? bulkActions : null}
        {columnToggle}
        {actions}
      </div>
    </div>
  );
}
