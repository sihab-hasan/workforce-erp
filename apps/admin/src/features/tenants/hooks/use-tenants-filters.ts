import { useState, useMemo, useCallback } from "react";
import type { TenantsFilters } from "../types/tenants-filters.types";

export function useTenantsFilters(initialPageSize: number = 20) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const queryFilters: TenantsFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status !== "all" ? status : undefined,
      plan: plan !== "all" ? plan : undefined,
      page,
      per_page: pageSize,
    }),
    [search, status, plan, page, pageSize],
  );

  const isDirty = search !== "" || status !== "all" || plan !== "all";

  const onReset = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPlan("all");
    setPage(1);
  }, []);

  const onFiltersChange = useCallback(
    (next: { search?: string; status?: string; plan?: string }) => {
      if (next.search !== undefined) setSearch(next.search);
      if (next.status !== undefined) setStatus(next.status);
      if (next.plan !== undefined) setPlan(next.plan);
      setPage(1);
    },
    [],
  );

  return {
    filters: { search, status, plan },
    page,
    pageSize,
    queryFilters,
    isDirty,
    onFiltersChange,
    onReset,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  };
}
