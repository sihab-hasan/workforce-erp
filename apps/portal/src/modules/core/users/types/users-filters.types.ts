import type { PaginationParams } from "@workforce-erp/types"
import type { UserAccountStatus, UserRole } from "./users.types"

/**
 * Query parameters accepted by `GET /api/v1/users`.
 * Extends the shared pagination params with Users-specific filters.
 */
export interface UsersFilters extends PaginationParams {
  /**
   * Full-text search term matched against name and email.
   * Backend uses a LIKE / fulltext search depending on DB config.
   */
  search?: string

  /** Filter by account status */
  status?: UserAccountStatus

  /** Filter by system role */
  role?: UserRole

  /**
   * Filter by organization id.
   * Super-admins may query across organisations; scoped admins are implicitly
   * restricted to their own org by the backend policy.
   */
  organization_id?: string

  /**
   * Sort column.
   * The backend validates the value against an allowlist to prevent injection.
   */
  sort_by?:
    "name" | "email" | "created_at" | "last_login_at" | "role" | "status"

  /** Sort direction */
  sort_direction?: "asc" | "desc"
}
