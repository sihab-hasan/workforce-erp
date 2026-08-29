import { useQuery } from "@tanstack/react-query";
import {
  timesheetsListQueryOptions,
  todayTimesheetQueryOptions,
  timesheetDetailQueryOptions,
} from "../api/timesheets.queries";
import type { TimesheetFilters } from "../types/timesheets-filters.types";

/**
 * Hook to query paginated / filtered timesheet records.
 */
export function useTimesheets(filters?: TimesheetFilters) {
  return useQuery(timesheetsListQueryOptions(filters));
}

/**
 * Hook to query today's active timesheet status for the employee.
 */
export function useTodayTimesheet(employeeId?: string) {
  return useQuery(todayTimesheetQueryOptions(employeeId));
}

/**
 * Hook to query a single timesheet record by ID.
 */
export function useTimesheetDetail(id: string) {
  return useQuery(timesheetDetailQueryOptions(id));
}

export { useLiveClockTimer, calcElapsedUnits, formatClockTime } from "./use-live-clock-timer";
export type { LiveClockTimerResult } from "./use-live-clock-timer";
