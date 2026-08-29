import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scopedHttpClient } from "#lib/api";
import { createLeaveApi } from "./leave.api";
import { leaveKeys } from "../query-keys";
import type { CreateLeavePayload } from "../types/leave.types";

// ---------------------------------------------------------------------------
// Shared API helper
// ---------------------------------------------------------------------------

function getLeaveApi() {
  return createLeaveApi(scopedHttpClient);
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Mutation hook for submitting a leave request.
 * On success, invalidates the leave list and allowance/options queries.
 */
export function useCreateLeaveMutation() {
  const queryClient = useQueryClient();
  const api = getLeaveApi();

  return useMutation({
    mutationFn: (payload: CreateLeavePayload) => api.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.options() });
    },
  });
}

/**
 * Mutation hook for cancelling a leave request.
 * On success, invalidates list, detail, and allowance/options queries.
 */
export function useCancelLeaveMutation(id: string) {
  const queryClient = useQueryClient();
  const api = getLeaveApi();

  return useMutation({
    mutationFn: () => api.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.options() });
    },
  });
}

/**
 * Mutation hook for approving a pending leave request.
 * On success, invalidates list, detail, and allowance/options queries
 * (an approval consumes the employee's allowance).
 */
export function useApproveLeaveMutation(id: string) {
  const queryClient = useQueryClient();
  const api = getLeaveApi();

  return useMutation({
    mutationFn: () => api.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.options() });
    },
  });
}

/**
 * Mutation hook for rejecting a pending leave request.
 * On success, invalidates list, detail, and allowance/options queries.
 */
export function useRejectLeaveMutation(id: string) {
  const queryClient = useQueryClient();
  const api = getLeaveApi();

  return useMutation({
    mutationFn: () => api.reject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: leaveKeys.options() });
    },
  });
}
