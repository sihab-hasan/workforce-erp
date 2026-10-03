import type { createHttpClient } from "@workforce-erp/api-client";
import type { PaginatedResponse, ApiResponse } from "@workforce-erp/contracts";
import type { UsersFilters } from "../types/users-filters.types";
import type {
  User,
  UserSummary,
  UserOrganization,
  RoleOption,
  EmployeeOption,
  InviteUserPayload,
  UpdateUserPayload,
} from "../types/users.types";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a Users API object bound to a specific HTTP client.
 *
 * Usage in a React app:
 * ```ts
 * const http = createHttpClient(env.apiBaseUrl, handleUnauthorized)
 * const usersApi = createUsersApi(http)
 * await usersApi.list({ page: 1, per_page: 20, status: 'active' })
 * ```
 */
export function createUsersApi(http: ReturnType<typeof createHttpClient>) {
  return {
    /**
     * `GET /api/v1/platform/users`
     * Fetches a paginated, filterable list of user summaries.
     */
    list(filters?: UsersFilters): Promise<PaginatedResponse<UserSummary>> {
      return http.get<PaginatedResponse<UserSummary>>(
        "/api/v1/platform/users",
        filters as Record<string, string | number | boolean | undefined | null>,
      );
    },

    /**
     * `GET /api/v1/platform/users/{id}`
     * Fetches the full user record including org and employee link details.
     */
    show(id: string): Promise<ApiResponse<User>> {
      return http.get<ApiResponse<User>>(`/api/v1/platform/users/${id}`);
    },

    /**
     * `POST /api/v1/platform/users`
     * Invites a new user with optional org, role, and employee link.
     */
    invite(payload: InviteUserPayload): Promise<ApiResponse<User>> {
      return http.post<ApiResponse<User>>("/api/v1/platform/users", payload);
    },

    /**
     * `PUT /api/v1/platform/users/{id}`
     * Updates basic account information (name, role, org, employee link).
     * Partial update — only supplied fields are changed.
     */
    update(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
      return http.put<ApiResponse<User>>(`/api/v1/platform/users/${id}`, payload);
    },

    /**
     * `PATCH /api/v1/platform/users/{id}/activate`
     * Activates a previously inactive or invited account.
     */
    activate(id: string, organizationId?: string): Promise<ApiResponse<User>> {
      return http.patch<ApiResponse<User>>(`/api/v1/platform/users/${id}/activate`, {
        organization_id: organizationId,
      });
    },

    /**
     * `PATCH /api/v1/platform/users/{id}/deactivate`
     * Deactivates an active account, revoking access without deleting data.
     */
    deactivate(id: string, organizationId?: string): Promise<ApiResponse<User>> {
      return http.patch<ApiResponse<User>>(`/api/v1/platform/users/${id}/deactivate`, {
        organization_id: organizationId,
      });
    },

    /**
     * `PATCH /api/v1/platform/users/{id}/suspend`
     * Suspends an account temporarily.
     */
    suspend(id: string, organizationId?: string): Promise<ApiResponse<User>> {
      return http.patch<ApiResponse<User>>(`/api/v1/platform/users/${id}/suspend`, {
        organization_id: organizationId,
      });
    },

    /**
     * `POST /api/v1/platform/users/{id}/resend-invitation`
     * Re-sends the invitation email to a user still in `invited` status.
     */
    resendInvitation(
      id: string,
      organizationId?: string,
    ): Promise<ApiResponse<{ delivered: boolean; sent_at: string | null }>> {
      return http.post<ApiResponse<{ delivered: boolean; sent_at: string | null }>>(
        `/api/v1/platform/users/${id}/resend-invitation`,
        {
          organization_id: organizationId,
        },
      );
    },

    /**
     * `GET /api/v1/platform/users/options/organizations`
     * Fetches organizations list for dropdown assignment.
     */
    listOrganizations(): Promise<ApiResponse<UserOrganization[]>> {
      return http.get<ApiResponse<UserOrganization[]>>(
        "/api/v1/platform/users/options/organizations",
      );
    },

    /**
     * `GET /api/v1/platform/users/options/roles`
     * Fetches available roles list for dropdown assignment.
     */
    listRoles(): Promise<ApiResponse<RoleOption[]>> {
      return http.get<ApiResponse<RoleOption[]>>("/api/v1/platform/users/options/roles");
    },

    /**
     * `GET /api/v1/platform/users/options/employees`
     * Fetches employee records for linking to user accounts.
     */
    listEmployees(): Promise<ApiResponse<EmployeeOption[]>> {
      return http.get<ApiResponse<EmployeeOption[]>>("/api/v1/platform/users/options/employees");
    },
  };
}

export type UsersApi = ReturnType<typeof createUsersApi>;
