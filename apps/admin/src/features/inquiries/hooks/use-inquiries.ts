import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteInquiry,
  fetchInquiries,
  fetchInquiryDetails,
  updateInquiryStatus,
} from "../api/inquiries.api";
import type { InquiriesFilterParams, InquiryStatus } from "../types/inquiries.types";
import {
  adminNotificationsQueryKey,
  adminUnreadCountQueryKey,
} from "#features/notifications/hooks/use-admin-notifications";

export const inquiriesQueryKey = ["platform-inquiries"] as const;

export function useInquiries(params: InquiriesFilterParams = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...inquiriesQueryKey, params],
    queryFn: () => fetchInquiries(params),
    refetchInterval: 10_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: InquiryStatus }) =>
      updateInquiryStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiriesQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminNotificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminUnreadCountQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteInquiry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiriesQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminNotificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminUnreadCountQueryKey });
    },
  });

  return {
    inquiries: query.data?.data ?? [],
    counts: query.data?.meta?.counts ?? {
      total: 0,
      new: 0,
      read: 0,
      responded: 0,
      archived: 0,
    },
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: () => query.refetch(),
    updateStatus: (id: string | number, status: InquiryStatus) =>
      updateStatusMutation.mutateAsync({ id, status }),
    deleteInquiry: (id: string | number) => deleteMutation.mutateAsync(id),
  };
}

export function useInquiryDetails(id: string | number | null | undefined) {
  return useQuery({
    queryKey: [...inquiriesQueryKey, "detail", id],
    queryFn: () =>
      id !== null && id !== undefined
        ? fetchInquiryDetails(id)
        : Promise.reject(new Error("No ID")),
    enabled: Boolean(id),
  });
}
