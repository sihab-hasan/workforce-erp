import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createHttpClient } from "@workforce-erp/api-client"
import { getStoredToken } from "@workforce-erp/auth-client"
import { environment } from "@/app/config/environment"
import { createTimesheetsApi } from "./timesheets.api"
import { timesheetsKeys } from "../query-keys"
import type {
  ClockInPayload,
  ClockOutPayload,
  Timesheet,
} from "../types/timesheets.types"

// ---------------------------------------------------------------------------
// Shared API helper
// ---------------------------------------------------------------------------

function getTimesheetsApi() {
  const http = createHttpClient(environment.apiBaseUrl, getStoredToken)
  return createTimesheetsApi(http)
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Mutation hook for employee clock-in.
 * On success, automatically invalidates active timesheet and timesheet list queries.
 */
export function useClockIn() {
  const queryClient = useQueryClient()
  const api = getTimesheetsApi()

  return useMutation({
    mutationFn: (payload?: ClockInPayload) => api.clockIn(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timesheetsKeys.all })
    },
  })
}

/**
 * Mutation hook for employee clock-out.
 * On success, automatically invalidates active timesheet and timesheet list queries.
 */
export function useClockOut() {
  const queryClient = useQueryClient()
  const api = getTimesheetsApi()

  return useMutation({
    mutationFn: (payload?: ClockOutPayload) => api.clockOut(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timesheetsKeys.all })
    },
  })
}

/**
 * Mutation hook for manual timesheet creation.
 */
export function useCreateTimesheet() {
  const queryClient = useQueryClient()
  const api = getTimesheetsApi()

  return useMutation({
    mutationFn: (payload: Partial<Timesheet>) => api.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timesheetsKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating an existing timesheet.
 */
export function useUpdateTimesheet() {
  const queryClient = useQueryClient()
  const api = getTimesheetsApi()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<Timesheet>
    }) => api.update(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: timesheetsKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: timesheetsKeys.lists() })
    },
  })
}

/**
 * Mutation hook for deleting a timesheet entry.
 */
export function useDeleteTimesheet() {
  const queryClient = useQueryClient()
  const api = getTimesheetsApi()

  return useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timesheetsKeys.lists() })
    },
  })
}
