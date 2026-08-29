import type { PaginationParams } from "@workforce-erp/contracts";
import type { LeaveStatus } from "./leave.types";

/**
 * Query parameters accepted by `GET /api/v1/leave-requests`.
 * Extends the shared pagination params with Leave-specific filters.
 */
export interface LeaveFilters extends PaginationParams {
  /** Filter by request status; `all` disables the filter. */
  status?: LeaveStatus | "all";

  /** Inclusive range start — keeps requests whose end date is on/after this date. */
  start_date?: string;

  /** Inclusive range end — keeps requests whose start date is on/before this date. */
  end_date?: string;

  /** When true, the backend returns only the current user's own requests. */
  mine?: boolean;
}
