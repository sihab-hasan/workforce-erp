import { createHttpClient } from "@workforce-erp/api-client"
import type { PaginatedResponse, ApiResponse } from "@workforce-erp/types"
import type { UsersFilters } from "../types/users-filters.types"
import type {
  User,
  UserSummary,
  UserOrganization,
  RoleOption,
  EmployeeOption,
  InviteUserPayload,
  UpdateUserPayload,
} from "../types/users.types"

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a Users API object bound to a specific HTTP client.
 *
 * Usage in a React app:
 * ```ts
 * const http = createHttpClient(env.apiBaseUrl, getStoredToken)
 * const usersApi = createUsersApi(http)
 * await usersApi.list({ page: 1, per_page: 20, status: 'active' })
 * ```
 */
export function createUsersApi(http: ReturnType<typeof createHttpClient>) {
  return {
    /**
     * `GET /api/users`
     * Fetches a paginated, filterable list of user summaries.
     */
    list(filters?: UsersFilters): Promise<PaginatedResponse<UserSummary>> {
      return http.get<PaginatedResponse<UserSummary>>(
        "/api/users",
        filters as Record<string, string | number | boolean | undefined | null>,
      )
    },

    /**
     * `GET /api/users/{id}`
     * Fetches the full user record including org and employee link details.
     */
    show(id: string): Promise<ApiResponse<User>> {
      return http.get<ApiResponse<User>>(`/api/users/${id}`)
    },

    /**
     * `POST /api/users`
     * Invites a new user with optional org, role, and employee link.
     */
    invite(payload: InviteUserPayload): Promise<ApiResponse<User>> {
      return http.post<ApiResponse<User>>("/api/users", payload)
    },

    /**
     * `PUT /api/users/{id}`
     * Updates basic account information (name, role, org, employee link).
     * Partial update — only supplied fields are changed.
     */
    update(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
      return http.put<ApiResponse<User>>(`/api/users/${id}`, payload)
    },

    /**
     * `PATCH /api/users/{id}/activate`
     * Activates a previously inactive or invited account.
     */
    activate(id: string): Promise<ApiResponse<User>> {
      return http.patch<ApiResponse<User>>(`/api/users/${id}/activate`)
    },

    /**
     * `PATCH /api/users/{id}/deactivate`
     * Deactivates an active account, revoking access without deleting data.
     */
    deactivate(id: string): Promise<ApiResponse<User>> {
      return http.patch<ApiResponse<User>>(`/api/users/${id}/deactivate`)
    },

    /**
     * `PATCH /api/users/{id}/suspend`
     * Suspends an account temporarily.
     */
    suspend(id: string): Promise<ApiResponse<User>> {
      return http.patch<ApiResponse<User>>(`/api/users/${id}/suspend`)
    },

    /**
     * `POST /api/users/{id}/resend-invitation`
     * Re-sends the invitation email to a user still in `invited` status.
     */
    resendInvitation(id: string): Promise<ApiResponse<{ sent_at: string }>> {
      return http.post<ApiResponse<{ sent_at: string }>>(
        `/api/users/${id}/resend-invitation`,
      )
    },

    /**
     * `GET /api/organizations`
     * Fetches organizations list for dropdown assignment.
     */
    listOrganizations(): Promise<ApiResponse<UserOrganization[]>> {
      return http.get<ApiResponse<UserOrganization[]>>("/api/organizations")
    },

    /**
     * `GET /api/roles`
     * Fetches available roles list for dropdown assignment.
     */
    listRoles(): Promise<ApiResponse<RoleOption[]>> {
      return http.get<ApiResponse<RoleOption[]>>("/api/roles")
    },

    /**
     * `GET /api/employees`
     * Fetches employee records for linking to user accounts.
     */
    listEmployees(): Promise<ApiResponse<EmployeeOption[]>> {
      return http.get<ApiResponse<EmployeeOption[]>>("/api/employees")
    },
  }
}

export type UsersApi = ReturnType<typeof createUsersApi>
