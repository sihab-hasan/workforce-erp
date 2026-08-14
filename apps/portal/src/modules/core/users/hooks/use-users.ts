import { useQuery } from "@tanstack/react-query"
import { usersListQueryOptions } from "../api/users.queries"
import type { UsersFilters } from "../types/users-filters.types"

/**
 * Fetches a paginated, filtered list of users from the API.
 *
 * Wraps `usersListQueryOptions` with `useQuery` so components get
 * the full TanStack Query result object (data, isPending, isError, etc.).
 *
 * @example
 * const { data, isPending, isError } = useUsers({ page: 1, status: 'active' })
 */
export function useUsers(filters?: UsersFilters) {
  return useQuery(usersListQueryOptions(filters))
}
