import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { LeaveStatus } from "../types/leave.types";
import type { LeaveFilters } from "../types/leave-filters.types";

const PAGE_SIZE = 15;

export function useLeaveFilters(base?: Pick<LeaveFilters, "mine">) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const statusParam = searchParams.get("status");
  const status: LeaveStatus | "all" =
    statusParam === "pending" ||
    statusParam === "approved" ||
    statusParam === "rejected" ||
    statusParam === "cancelled"
      ? statusParam
      : "all";
  const search = searchParams.get("search") ?? "";

  const setPage = useCallback(
    (nextPage: number) => {
      const next = new URLSearchParams(searchParams);
      if (nextPage <= 1) next.delete("page");
      else next.set("page", String(nextPage));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setStatus = useCallback(
    (nextStatus: LeaveStatus | "all") => {
      const next = new URLSearchParams(searchParams);
      if (nextStatus === "all") next.delete("status");
      else next.set("status", nextStatus);
      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setSearch = useCallback(
    (nextSearch: string) => {
      const next = new URLSearchParams(searchParams);
      const trimmed = nextSearch.trim();
      if (!trimmed) next.delete("search");
      else next.set("search", trimmed);
      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("status");
    next.delete("search");
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const filters: LeaveFilters = {
    ...base,
    page,
    per_page: PAGE_SIZE,
    ...(status !== "all" ? { status } : {}),
    ...(search ? { search } : {}),
  };

  return {
    page,
    pageSize: PAGE_SIZE,
    status,
    search,
    filters,
    setPage,
    setStatus,
    setSearch,
    resetFilters,
  };
}
