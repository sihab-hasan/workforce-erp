import { useState, useMemo } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import {
  MOCK_EMPLOYEES,
  DEPARTMENTS,
  LOCATIONS,
} from "@/modules/people/employees/data/employees.data.ts"
import { EmployeeSummaryCards } from "@/modules/people/employees/components/EmployeeSummaryCards.tsx"
import { EmployeeFilters } from "@/modules/people/employees/components/EmployeeFilters.tsx"
import type { EmployeeFiltersState } from "@/modules/people/employees/components/EmployeeFilters.tsx"
import { EmployeeTable } from "@/modules/people/employees/components/EmployeeTable.tsx"

const PAGE_SIZE = 10

const DEFAULT_FILTERS: EmployeeFiltersState = {
  search: "",
  department: "all",
  status: "all",
  location: "all",
}

/**
 * EmployeeDirectoryPage
 *
 * Front-end-only implementation using mock data.
 * To integrate with the API:
 *  1. Replace MOCK_EMPLOYEES with a React Query / SWR hook.
 *  2. Push filter state into the query params.
 *  3. Drive pagination from the server response's meta.total.
 */
export default function EmployeeDirectoryPage() {
  const [filters, setFilters] = useState<EmployeeFiltersState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const handleFiltersChange = (next: Partial<EmployeeFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1) // Reset to first page on any filter change
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  /** Client-side filtering — replace with server-driven query when API is ready. */
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return MOCK_EMPLOYEES.filter((emp) => {
      if (q) {
        const haystack = [emp.name, emp.title, emp.email]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.department !== "all" && emp.department !== filters.department)
        return false
      if (filters.status !== "all" && emp.status !== filters.status)
        return false
      if (filters.location !== "all" && emp.location !== filters.location)
        return false
      return true
    })
  }, [filters])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Employees
          </p>
          {/*
           * h2 is intentional: the <h1> lives inside PortalHeader for this route.
           * This is the page-section heading within the main content area.
           */}
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Employee Directory
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse, search, and manage your organisation's workforce.
          </p>
        </div>

        <Button
          id="add-employee-btn"
          className="shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="size-4" aria-hidden />
          Add Employee
        </Button>
      </header>

      <Separator />

      {/* ── Summary KPI cards ─────────────────────────────────────────────── */}
      <EmployeeSummaryCards employees={MOCK_EMPLOYEES} />

      <Separator />

      {/* ── Search & filters ──────────────────────────────────────────────── */}
      <EmployeeFilters
        filters={filters}
        departments={DEPARTMENTS}
        locations={LOCATIONS}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      {/* ── Employee list / table ─────────────────────────────────────────── */}
      <EmployeeTable
        employees={paginated}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={filtered.length}
        onPageChange={setPage}
      />
    </div>
  )
}
