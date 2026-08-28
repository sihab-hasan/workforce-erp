import { queryOptions } from "@tanstack/react-query";
import { scopedHttpClient } from "#lib/api";
import { createUsersApi } from "./users.api";
import { usersKeys } from "../query-keys";
import type { UsersFilters } from "../types/users-filters.types";

// ---------------------------------------------------------------------------
// Shared API instance
// Consuming hooks pass this to useQuery / useSuspenseQuery via queryOptions().
// ---------------------------------------------------------------------------

function getUsersApi() {
  return createUsersApi(scopedHttpClient);
}

// ---------------------------------------------------------------------------
// Query option factories (compatible with TanStack Query v5 queryOptions())
// ---------------------------------------------------------------------------

/**
 * Options for fetching a paginated / filtered list of users.
 *
 * @example
 * const { data } = useQuery(usersListQueryOptions({ page: 1, status: 'active' }))
 */
export function usersListQueryOptions(filters?: UsersFilters) {
  const api = getUsersApi();
  return queryOptions({
    queryKey: usersKeys.list(filters),
    queryFn: () => api.list(filters),
  });
}

/**
 * Options for fetching a single user by id.
 *
 * @example
 * const { data } = useSuspenseQuery(userDetailQueryOptions(userId))
 */
export function userDetailQueryOptions(id: string) {
  const api = getUsersApi();
  return queryOptions({
    queryKey: usersKeys.detail(id),
    queryFn: () => api.show(id),
    enabled: Boolean(id),
  });
}

/**
 * Options for fetching organizations for dropdown selection.
 */
export function organizationsQueryOptions() {
  const api = getUsersApi();
  return queryOptions({
    queryKey: usersKeys.organizations(),
    queryFn: () => api.listOrganizations(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

/**
 * Options for fetching roles for dropdown selection.
 */
export function rolesQueryOptions() {
  const api = getUsersApi();
  return queryOptions({
    queryKey: usersKeys.roles(),
    queryFn: () => api.listRoles(),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Options for fetching employees for dropdown linking.
 */
export function employeesQueryOptions() {
  const api = getUsersApi();
  return queryOptions({
    queryKey: usersKeys.employees(),
    queryFn: () => api.listEmployees(),
    staleTime: 1000 * 60 * 5,
  });
}
