import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui";
import type { ActiveFilter } from "./filter.types";

function formatValue(filter: ActiveFilter) {
  if (filter.displayValue) return filter.displayValue;
  if (Array.isArray(filter.value))
    return filter.value.filter((item) => item != null && item !== "").join(", ");
  if (typeof filter.value === "boolean") return filter.value ? "Yes" : "No";
  return filter.value == null || filter.value === "" ? "Any" : String(filter.value);
}

export type ActiveFiltersProps = React.ComponentProps<"div"> & {
  filters: ActiveFilter[];
  onRemove?: (id: string) => void;
  onClear?: () => void;
};

export function ActiveFilters({
  filters,
  onRemove,
  onClear,
  className,
  ...props
}: ActiveFiltersProps) {
  if (!filters.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {filters.map((filter) => (
        <Badge key={filter.id} variant="secondary" className="h-7 gap-1.5 rounded-full px-2.5">
          <span className="font-medium">{filter.label}</span>
          <span className="text-muted-foreground">{formatValue(filter)}</span>
          {onRemove ? (
            <button
              type="button"
              aria-label={`Remove ${filter.label} filter`}
              className="ml-0.5 rounded-full px-1 text-muted-foreground hover:bg-background hover:text-foreground"
              onClick={() => onRemove(filter.id)}
            >
              ×
            </button>
          ) : null}
        </Badge>
      ))}
      {onClear ? (
        <Button variant="ghost" size="xs" onClick={onClear}>
          Clear all
        </Button>
      ) : null}
    </div>
  );
}
