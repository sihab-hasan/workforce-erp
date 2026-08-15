import { useState, useEffect } from "react"
import { UserPlus, Loader2 } from "lucide-react"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { DEPARTMENTS, LOCATIONS } from "@/modules/people/employees/data/employees.data.ts"
import { EmployeeSummaryCards } from "@/modules/people/employees/components/EmployeeSummaryCards.tsx"
import { EmployeeFilters } from "@/modules/people/employees/components/EmployeeFilters.tsx"
import type { EmployeeFiltersState } from "@/modules/people/employees/components/EmployeeFilters.tsx"
import { EmployeeTable } from "@/modules/people/employees/components/EmployeeTable.tsx"
import { useUrlState } from "@/hooks/use-url-state.ts"
import { apiClient } from "@/lib/api.ts"
import type { Employee } from "@/modules/people/employees/types/employees.types.ts"

const PAGE_SIZE = 10



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
  const [urlState, setUrlState] = useUrlState({
    search: "",
    department: "all",
    status: "all",
    location: "all",
    page: 1,
  })

  const [employees, setEmployees] = useState<Employee[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    Promise.resolve().then(() => {
      if (!ignore) {
        setIsLoading(true)
      }
    })
    apiClient
      .getEmployees({
        search: urlState.search,
        department: urlState.department === "all" ? undefined : urlState.department,
        status: urlState.status === "all" ? undefined : urlState.status,
        location: urlState.location === "all" ? undefined : urlState.location,
        page: urlState.page,
      })
      .then((res) => {
        if (!ignore) {
          setEmployees(res.data)
          setTotalCount(res.meta.total)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to fetch employees:", err)
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [urlState])

  const handleFiltersChange = (next: Partial<EmployeeFiltersState>) => {
    setUrlState({ ...next, page: 1 })
  }

  const handleReset = () => {
    setUrlState({
      search: "",
      department: "all",
      status: "all",
      location: "all",
      page: 1,
    })
  }

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
      <EmployeeSummaryCards employees={employees} />

      <Separator />

      {/* ── Search & filters ──────────────────────────────────────────────── */}
      <EmployeeFilters
        filters={urlState as EmployeeFiltersState}
        departments={DEPARTMENTS}
        locations={LOCATIONS}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      {/* ── Employee list / table ─────────────────────────────────────────── */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <EmployeeTable
          employees={employees}
          page={urlState.page || 1}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={(page) => setUrlState({ page })}
        />
      </div>
    </div>
  )
}
