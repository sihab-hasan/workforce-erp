import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import type { EmployeeFiltersState } from "../components/EmployeeFilters"
import type { EmploymentStatus } from "../types/employees.types"

const PAGE_SIZE = 10

export function useEmployeesFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const filters = useMemo<EmployeeFiltersState>(
    () => ({
      search: searchParams.get("search") ?? "",
      department: searchParams.get("department") ?? "all",
      status:
        (searchParams.get("status") as EmploymentStatus | "all" | null) ??
        "all",
      location: searchParams.get("location") ?? "all",
    }),
    [searchParams]
  )

  const write = useCallback(
    (nextFilters: EmployeeFiltersState, nextPage: number) => {
      const next = new URLSearchParams()
      if (nextFilters.search) next.set("search", nextFilters.search)
      if (nextFilters.department !== "all")
        next.set("department", nextFilters.department)
      if (nextFilters.status !== "all") next.set("status", nextFilters.status)
      if (nextFilters.location !== "all")
        next.set("location", nextFilters.location)
      if (nextPage > 1) next.set("page", String(nextPage))
      setSearchParams(next, { replace: true })
    },
    [setSearchParams]
  )

  const onFiltersChange = useCallback(
    (partial: Partial<EmployeeFiltersState>) => {
      write({ ...filters, ...partial }, 1)
    },
    [filters, write]
  )

  const onReset = useCallback(
    () =>
      write(
        { search: "", department: "all", status: "all", location: "all" },
        1
      ),
    [write]
  )
  const onPageChange = useCallback(
    (nextPage: number) => write(filters, nextPage),
    [filters, write]
  )

  return {
    filters,
    page,
    pageSize: PAGE_SIZE,
    queryFilters: {
      page,
      per_page: PAGE_SIZE,
      search: filters.search || undefined,
      department: filters.department !== "all" ? filters.department : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      location: filters.location !== "all" ? filters.location : undefined,
    },
    onFiltersChange,
    onReset,
    onPageChange,
  }
}
