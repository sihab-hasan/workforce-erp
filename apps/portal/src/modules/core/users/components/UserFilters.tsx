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
import type { UserAccountStatus, UserRole } from "../types/users.types"
import type { UsersFiltersState } from "../hooks/use-users-filters"

const STATUS_OPTIONS: { label: string; value: UserAccountStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Invited", value: "invited" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
]

const ROLE_OPTIONS: { label: string; value: UserRole | "all" }[] = [
  { label: "All roles", value: "all" },
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Staff", value: "staff" },
  { label: "Read-only", value: "readonly" },
]

export interface UserFiltersProps {
  filters: UsersFiltersState
  isDirty: boolean
  onFiltersChange: (next: Partial<UsersFiltersState>) => void
  onReset: () => void
  className?: string
}

export function UserFilters({
  filters,
  isDirty,
  onFiltersChange,
  onReset,
  className,
}: UserFiltersProps) {
  return (
    <div
      role="search"
      aria-label="Filter users"
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className ?? ""}`}
    >
      {/* ── Search input ──────────────────────────────────────── */}
      <InputGroup className="min-w-0 flex-1 sm:max-w-sm">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id="user-search"
          type="search"
          placeholder="Search by name or email…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.currentTarget.value })}
          aria-label="Search users"
          autoComplete="off"
        />
      </InputGroup>

      {/* ── Status filter ─────────────────────────────────────── */}
      <Select
        value={filters.status}
        onValueChange={(val) =>
          onFiltersChange({ status: val as UserAccountStatus | "all" })
        }
      >
        <SelectTrigger
          id="filter-user-status"
          aria-label="Filter by account status"
          className="w-full sm:w-44"
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

      {/* ── Role filter ────────────────────────────────────────── */}
      <Select
        value={filters.role}
        onValueChange={(val) =>
          onFiltersChange({ role: val as UserRole | "all" })
        }
      >
        <SelectTrigger
          id="filter-user-role"
          aria-label="Filter by system role"
          className="w-full sm:w-40"
        >
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── Reset ─────────────────────────────────────────────── */}
      {isDirty && (
        <Button
          id="reset-user-filters"
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
