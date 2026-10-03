import { Search, X, Globe } from "lucide-react";
import { Input } from "@workforce-erp/ui/components/input";
import { Button } from "@workforce-erp/ui/components/button";

export interface OrganizationFiltersProps {
  filters: {
    search: string;
    country?: string;
  };
  isDirty: boolean;
  onFiltersChange: (next: { search?: string; country?: string }) => void;
  onReset: () => void;
}

export function OrganizationFilters({
  filters,
  isDirty,
  onFiltersChange,
  onReset,
}: OrganizationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations by name, legal entity, or contact..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9 text-xs"
          />
        </div>

        {/* Quick Country / Region Filter */}
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <select
            value={filters.country || "all"}
            onChange={(e) =>
              onFiltersChange({ country: e.target.value === "all" ? "" : e.target.value })
            }
            className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Countries</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Singapore">Singapore</option>
            <option value="Bangladesh">Bangladesh</option>
          </select>
        </div>
      </div>

      {isDirty ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 self-end text-xs text-muted-foreground hover:text-foreground md:self-auto"
        >
          <X className="mr-1.5 size-3.5" />
          Reset Filters
        </Button>
      ) : null}
    </div>
  );
}
