import { queryOptions, useQuery } from "@tanstack/react-query";
import { scopedHttpClient } from "#lib/api";
import { createLeaveApi } from "./leave.api";
import { leaveKeys } from "../query-keys";
import type { LeaveFilters } from "../types/leave-filters.types";

// ---------------------------------------------------------------------------
// Shared API instance
// ---------------------------------------------------------------------------

function getLeaveApi() {
  return createLeaveApi(scopedHttpClient);
}

// ---------------------------------------------------------------------------
// Query option factories (compatible with TanStack Query v5 queryOptions())
// ---------------------------------------------------------------------------

/**
 * Options for fetching a paginated / filtered list of leave requests.
 */
export function leaveListQueryOptions(filters?: LeaveFilters) {
  const api = getLeaveApi();
  return queryOptions({
    queryKey: leaveKeys.list(filters),
    queryFn: () => api.list(filters),
  });
}

/**
 * Options for fetching leave types and the current user's allowance balances.
 */
export function leaveOptionsQueryOptions() {
  const api = getLeaveApi();
  return queryOptions({
    queryKey: leaveKeys.options(),
    queryFn: () => api.options(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Options for fetching a single leave request by id.
 */
export function leaveDetailQueryOptions(id: string) {
  const api = getLeaveApi();
  return queryOptions({
    queryKey: leaveKeys.detail(id),
    queryFn: () => api.show(id),
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Hook to query paginated / filtered leave requests.
 */
export function useLeaveListQuery(filters?: LeaveFilters) {
  return useQuery(leaveListQueryOptions(filters));
}

/**
 * Hook to query leave types and the current user's allowance balances.
 */
export function useLeaveOptionsQuery() {
  return useQuery(leaveOptionsQueryOptions());
}

/**
 * Hook to query a single leave request by ID.
 */
export function useLeaveDetailsQuery(id: string) {
  return useQuery(leaveDetailQueryOptions(id));
}
