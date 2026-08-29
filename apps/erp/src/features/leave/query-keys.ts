import type { LeaveFilters } from "./types/leave-filters.types";

/**
 * Centralised TanStack Query key factory for the Leave module.
 */
export const leaveKeys = {
  /** Root key — invalidates all leave queries */
  all: ["leaves"] as const,

  /** List queries (with optional filter scope) */
  lists: () => [...leaveKeys.all, "list"] as const,
  list: (filters?: LeaveFilters) => [...leaveKeys.lists(), { filters }] as const,

  /** Leave type / allowance options queries */
  options: () => [...leaveKeys.all, "options"] as const,

  /** Detail queries */
  details: () => [...leaveKeys.all, "detail"] as const,
  detail: (id: string) => [...leaveKeys.details(), id] as const,
} as const;
