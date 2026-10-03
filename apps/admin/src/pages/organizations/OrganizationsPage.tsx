import { useState } from "react";
import { RefreshCw, Layers } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
import { useOrganizations } from "#features/organizations/hooks/use-organizations";
import { OrganizationKpiCards } from "#features/organizations/components/OrganizationKpiCards";
import { OrganizationFilters } from "#features/organizations/components/OrganizationFilters";
import { OrganizationTable } from "#features/organizations/components/OrganizationTable";

export function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const queryFilters = {
    search: search.trim() || undefined,
    country: country || undefined,
    page,
    per_page: pageSize,
  };

  const isDirty = search !== "" || country !== "";

  const { data, isPending, isFetching, isError, refetch } = useOrganizations(queryFilters);

  const organizations = data?.data ?? [];
  const totalCount = data?.meta?.total ?? organizations.length;

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Enterprise Organizations & Hierarchy
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Inspect corporate entities, office branches, functional departments, and employee
            workforce structures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </header>

      {/* ── KPI Summary Cards ────────────────────────────────────────────────── */}
      <OrganizationKpiCards
        organizations={organizations}
        totalCount={totalCount}
        loading={isPending}
      />

      <Separator />

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <OrganizationFilters
        filters={{ search, country }}
        isDirty={isDirty}
        onFiltersChange={(next) => {
          if (next.search !== undefined) setSearch(next.search);
          if (next.country !== undefined) setCountry(next.country);
          setPage(1);
        }}
        onReset={() => {
          setSearch("");
          setCountry("");
          setPage(1);
        }}
      />

      {/* ── Organizations Data Table ─────────────────────────────────────────── */}
      <OrganizationTable
        organizations={organizations}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        isPending={isPending}
        isError={isError}
        onPageChange={setPage}
        onRetry={() => void refetch()}
      />
    </div>
  );
}

export default OrganizationsPage;
