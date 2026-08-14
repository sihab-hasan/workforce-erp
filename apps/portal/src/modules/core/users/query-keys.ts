import type { UsersFilters } from "./types/users-filters.types"

/**
 * Centralised TanStack Query key factory for the Users module.
 *
 * All query keys are nested under the `"users"` root so that
 * `queryClient.invalidateQueries({ queryKey: usersKeys.all })` can
 * invalidate the entire module at once.
 */
export const usersKeys = {
  /** Root key — invalidates all users queries */
  all: ["users"] as const,

  /** List queries (with optional filter scope) */
  lists: () => [...usersKeys.all, "list"] as const,
  list: (filters?: UsersFilters) =>
    [...usersKeys.lists(), { filters }] as const,

  /** Detail queries */
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,

  /** Dropdown option queries */
  organizations: () => [...usersKeys.all, "options", "organizations"] as const,
  roles: () => [...usersKeys.all, "options", "roles"] as const,
  employees: () => [...usersKeys.all, "options", "employees"] as const,
} as const
