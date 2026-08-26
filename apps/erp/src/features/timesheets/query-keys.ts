import type { TimesheetFilters } from "./types/timesheets-filters.types";

/**
 * Centralised TanStack Query key factory for the Timesheet & Clock-In module.
 */
export const timesheetsKeys = {
  /** Root key — invalidates all timesheet queries */
  all: ["timesheets"] as const,

  /** List queries (with optional filter scope) */
  lists: () => [...timesheetsKeys.all, "list"] as const,
  list: (filters?: TimesheetFilters) => [...timesheetsKeys.lists(), { filters }] as const,

  /** Today status queries */
  todays: () => [...timesheetsKeys.all, "today"] as const,
  today: (employeeId?: string) => [...timesheetsKeys.todays(), employeeId ?? "current"] as const,

  /** Detail queries */
  details: () => [...timesheetsKeys.all, "detail"] as const,
  detail: (id: string) => [...timesheetsKeys.details(), id] as const,
} as const;
