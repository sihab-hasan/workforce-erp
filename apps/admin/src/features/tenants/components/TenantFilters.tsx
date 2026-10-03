import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@workforce-erp/ui/components/input";
import { Button } from "@workforce-erp/ui/components/button";

export interface TenantFiltersProps {
  filters: {
    search: string;
    status: string;
    plan: string;
  };
  isDirty: boolean;
  onFiltersChange: (next: { search?: string; status?: string; plan?: string }) => void;
  onReset: () => void;
}

export function TenantFilters({ filters, isDirty, onFiltersChange, onReset }: TenantFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, slug, email, domain…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pl-9 pr-8"
        />
        {filters.search ? (
          <button
            type="button"
            onClick={() => onFiltersChange({ search: "" })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Filter selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
          {[
            { id: "all", label: "All Status" },
            { id: "active", label: "Active" },
            { id: "trial", label: "Trial" },
            { id: "suspended", label: "Suspended" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onFiltersChange({ status: s.id })}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filters.status === s.id
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Plan Filter */}
        <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
          {[
            { id: "all", label: "All Plans" },
            { id: "enterprise", label: "Enterprise" },
            { id: "pro", label: "Pro" },
            { id: "starter", label: "Starter" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onFiltersChange({ plan: p.id })}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filters.plan === p.id
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isDirty ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
