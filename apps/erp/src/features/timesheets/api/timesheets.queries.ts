import { queryOptions } from "@tanstack/react-query";
import { createHttpClient } from "@workforce-erp/api-client";
import { environment } from "#config/env";
import { handleUnauthorized } from "#lib/api";
import { createTimesheetsApi } from "./timesheets.api";
import { timesheetsKeys } from "../query-keys";
import type { TimesheetFilters } from "../types/timesheets-filters.types";

// ---------------------------------------------------------------------------
// Shared API instance
// ---------------------------------------------------------------------------

function getTimesheetsApi() {
  const http = createHttpClient(environment.apiBaseUrl, handleUnauthorized);
  return createTimesheetsApi(http);
}

// ---------------------------------------------------------------------------
// Query option factories (compatible with TanStack Query v5 queryOptions())
// ---------------------------------------------------------------------------

/**
 * Options for fetching a paginated / filtered list of timesheets.
 */
export function timesheetsListQueryOptions(filters?: TimesheetFilters) {
  const api = getTimesheetsApi();
  return queryOptions({
    queryKey: timesheetsKeys.list(filters),
    queryFn: () => api.list(filters),
  });
}

/**
 * Options for fetching today's active timesheet status for the employee.
 */
export function todayTimesheetQueryOptions(employeeId?: string) {
  const api = getTimesheetsApi();
  return queryOptions({
    queryKey: timesheetsKeys.today(employeeId),
    queryFn: () => api.getTodayStatus(employeeId),
    staleTime: 1000 * 30, // 30 seconds fresh
    refetchInterval: 1000 * 60, // Refresh every 1 minute
  });
}

/**
 * Options for fetching a single timesheet by id.
 */
export function timesheetDetailQueryOptions(id: string) {
  const api = getTimesheetsApi();
  return queryOptions({
    queryKey: timesheetsKeys.detail(id),
    queryFn: () => api.show(id),
    enabled: Boolean(id),
  });
}
