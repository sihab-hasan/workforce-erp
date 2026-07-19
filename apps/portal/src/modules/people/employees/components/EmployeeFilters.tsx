import { Search, X } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workforce-erp/ui/components/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select"
import { Button } from "@workforce-erp/ui/components/button"
import type { EmploymentStatus } from "@/modules/people/employees/types/employees.types.ts"

export interface EmployeeFiltersState {
  search: string
  department: string
  status: EmploymentStatus | "all"
  location: string
}

export interface EmployeeFiltersProps {
  filters: EmployeeFiltersState
  departments: string[]
  locations: string[]
  onFiltersChange: (next: Partial<EmployeeFiltersState>) => void
  onReset: () => void
  className?: string
}

const STATUS_OPTIONS: { label: string; value: EmploymentStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on-leave" },
  { label: "Probation", value: "probation" },
  { label: "Inactive", value: "inactive" },
]

export function EmployeeFilters({
  filters,
  departments,
  locations,
  onFiltersChange,
  onReset,
  className,
}: EmployeeFiltersProps) {
  const isDirty =
    filters.search !== "" ||
    filters.department !== "all" ||
    filters.status !== "all" ||
    filters.location !== "all"

  return (
    <div
      role="search"
      aria-label="Filter employees"
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className ?? ""}`}
    >
      {/* ── Search input ──────────────────────────────────────── */}
      <InputGroup className="min-w-0 flex-1 sm:max-w-sm">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id="employee-search"
          type="search"
          placeholder="Search by name, title, or email…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.currentTarget.value })}
          aria-label="Search employees"
          autoComplete="off"
        />
      </InputGroup>

      {/* ── Department filter ─────────────────────────────────── */}
      <Select
        value={filters.department}
        onValueChange={(val) => onFiltersChange({ department: val as string })}
      >
        <SelectTrigger
          id="filter-department"
          aria-label="Filter by department"
          className="w-full sm:w-44"
        >
          <SelectValue placeholder="All departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Status filter ─────────────────────────────────────── */}
      <Select
        value={filters.status}
        onValueChange={(val) =>
          onFiltersChange({ status: val as EmploymentStatus | "all" })
        }
      >
        <SelectTrigger
          id="filter-status"
          aria-label="Filter by status"
          className="w-full sm:w-40"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Location filter ───────────────────────────────────── */}
      <Select
        value={filters.location}
        onValueChange={(val) => onFiltersChange({ location: val as string })}
      >
        <SelectTrigger
          id="filter-location"
          aria-label="Filter by location"
          className="w-full sm:w-36"
        >
          <SelectValue placeholder="All locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Reset ─────────────────────────────────────────────── */}
      {isDirty && (
        <Button
          id="reset-filters"
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Clear all filters"
          className="shrink-0"
        >
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  )
}
