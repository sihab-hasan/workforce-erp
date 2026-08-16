import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import type { UsersFilters } from "../types/users-filters.types"
import type { UserAccountStatus, UserRole } from "../types/users.types"

const PAGE_SIZE = 15

export interface UsersFiltersState {
  search: string
  status: UserAccountStatus | "all"
  role: UserRole | "all"
}

const DEFAULT_FILTERS: UsersFiltersState = {
  search: "",
  status: "all",
  role: "all",
}

export function useUsersFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const filters = useMemo<UsersFiltersState>(
    () => ({
      search: searchParams.get("search") ?? "",
      status:
        (searchParams.get("status") as UserAccountStatus | "all" | null) ??
        "all",
      role: (searchParams.get("role") as UserRole | "all" | null) ?? "all",
    }),
    [searchParams]
  )

  const write = useCallback(
    (nextFilters: UsersFiltersState, nextPage: number) => {
      const next = new URLSearchParams()
      if (nextFilters.search) next.set("search", nextFilters.search)
      if (nextFilters.status !== "all") next.set("status", nextFilters.status)
      if (nextFilters.role !== "all") next.set("role", nextFilters.role)
      if (nextPage > 1) next.set("page", String(nextPage))
      setSearchParams(next, { replace: true })
    },
    [setSearchParams]
  )

  const onFiltersChange = useCallback(
    (partial: Partial<UsersFiltersState>) =>
      write({ ...filters, ...partial }, 1),
    [filters, write]
  )
  const onReset = useCallback(() => write(DEFAULT_FILTERS, 1), [write])
  const onPageChange = useCallback(
    (nextPage: number) => write(filters, nextPage),
    [filters, write]
  )

  const queryFilters: UsersFilters = {
    page,
    per_page: PAGE_SIZE,
    search: filters.search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    role: filters.role !== "all" ? filters.role : undefined,
  }

  return {
    filters,
    page,
    pageSize: PAGE_SIZE,
    queryFilters,
    isDirty:
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.role !== "all",
    onFiltersChange,
    onReset,
    onPageChange,
  }
}
