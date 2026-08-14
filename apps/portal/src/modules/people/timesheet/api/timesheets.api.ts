import { createHttpClient } from "@workforce-erp/api-client"
import type { PaginatedResponse, ApiResponse } from "@workforce-erp/types"
import type { TimesheetFilters } from "../types/timesheets-filters.types"
import type {
  Timesheet,
  ClockInPayload,
  ClockOutPayload,
  TodayTimesheetStatus,
} from "../types/timesheets.types"

/**
 * Creates a Timesheets API object bound to a specific HTTP client.
 */
export function createTimesheetsApi(http: ReturnType<typeof createHttpClient>) {
  return {
    /**
     * `GET /api/v1/timesheets`
     * Fetches a paginated, filterable list of timesheet records.
     */
    list(filters?: TimesheetFilters): Promise<PaginatedResponse<Timesheet>> {
      return http.get<PaginatedResponse<Timesheet>>(
        "/api/v1/timesheets",
        filters as Record<string, string | number | boolean | undefined | null>
      )
    },

    /**
     * `GET /api/v1/timesheets/today`
     * Fetches the current / today's active timesheet status for the user/employee.
     */
    getTodayStatus(employeeId?: string): Promise<ApiResponse<TodayTimesheetStatus>> {
      const params = employeeId ? { employee_id: employeeId } : undefined
      return http.get<ApiResponse<TodayTimesheetStatus>>(
        "/api/v1/timesheets/today",
        params
      )
    },

    /**
     * `GET /api/v1/timesheets/{id}`
     * Fetches the full timesheet details by ID.
     */
    show(id: string): Promise<ApiResponse<Timesheet>> {
      return http.get<ApiResponse<Timesheet>>(`/api/v1/timesheets/${id}`)
    },

    /**
     * `POST /api/v1/timesheets/clock-in`
     * Records a clock-in event.
     */
    clockIn(payload?: ClockInPayload): Promise<ApiResponse<Timesheet>> {
      return http.post<ApiResponse<Timesheet>>(
        "/api/v1/timesheets/clock-in",
        payload ?? {}
      )
    },

    /**
     * `POST /api/v1/timesheets/clock-out`
     * Records a clock-out event for the active session.
     */
    clockOut(payload?: ClockOutPayload): Promise<ApiResponse<Timesheet>> {
      return http.post<ApiResponse<Timesheet>>(
        "/api/v1/timesheets/clock-out",
        payload ?? {}
      )
    },

    /**
     * `POST /api/v1/timesheets`
     * Creates a manual timesheet record.
     */
    create(payload: Partial<Timesheet>): Promise<ApiResponse<Timesheet>> {
      return http.post<ApiResponse<Timesheet>>("/api/v1/timesheets", payload)
    },

    /**
     * `PUT /api/v1/timesheets/{id}`
     * Updates an existing timesheet record.
     */
    update(
      id: string,
      payload: Partial<Timesheet>
    ): Promise<ApiResponse<Timesheet>> {
      return http.put<ApiResponse<Timesheet>>(
        `/api/v1/timesheets/${id}`,
        payload
      )
    },

    /**
     * `DELETE /api/v1/timesheets/{id}`
     * Deletes a timesheet record.
     */
    delete(id: string): Promise<ApiResponse<void>> {
      return http.delete<ApiResponse<void>>(`/api/v1/timesheets/${id}`)
    },
  }
}

export type TimesheetsApi = ReturnType<typeof createTimesheetsApi>
