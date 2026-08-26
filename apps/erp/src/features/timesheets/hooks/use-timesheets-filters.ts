import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { TimesheetFilters } from "../types/timesheets-filters.types";

const PAGE_SIZE = 15;

export function useTimesheetsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const setPage = useCallback(
    (nextPage: number) => {
      const next = new URLSearchParams(searchParams);
      if (nextPage <= 1) next.delete("page");
      else next.set("page", String(nextPage));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const filters: TimesheetFilters = {
    page,
    per_page: PAGE_SIZE,
  };

  return { page, pageSize: PAGE_SIZE, filters, setPage };
}
