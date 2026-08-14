import { useState, useCallback } from "react"
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

/**
 * Manages the local UI filter state for the Users list and derives the
 * `UsersFilters` payload to pass to the API query.
 *
 * @returns filters state, page, page size, derived query params, and handlers
 */
export function useUsersFilters() {
  const [filters, setFilters] = useState<UsersFiltersState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const handleFiltersChange = useCallback(
    (next: Partial<UsersFiltersState>) => {
      setFilters((prev) => ({ ...prev, ...next }))
      setPage(1) // Always reset to page 1 when filters change
    },
    []
  )

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  /** Derived query params sent to the API */
  const queryFilters: UsersFilters = {
    page,
    per_page: PAGE_SIZE,
    search: filters.search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    role: filters.role !== "all" ? filters.role : undefined,
  }

  const isDirty =
    filters.search !== "" || filters.status !== "all" || filters.role !== "all"

  return {
    filters,
    page,
    pageSize: PAGE_SIZE,
    queryFilters,
    isDirty,
    onFiltersChange: handleFiltersChange,
    onReset: handleReset,
    onPageChange: handlePageChange,
  }
}
