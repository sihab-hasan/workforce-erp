import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminNotifications,
  fetchAdminUnreadCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "../api/notifications.api";

export const adminNotificationsQueryKey = ["admin-notifications"] as const;
export const adminUnreadCountQueryKey = ["admin-notifications", "unread-count"] as const;

export function useAdminNotifications(enabled = true) {
  const queryClient = useQueryClient();

  const unreadCountQuery = useQuery({
    queryKey: adminUnreadCountQueryKey,
    queryFn: fetchAdminUnreadCount,
    enabled,
    refetchInterval: 8_000, // Poll every 8s for live real-time feel
    refetchOnWindowFocus: true,
  });

  const notificationsQuery = useQuery({
    queryKey: adminNotificationsQueryKey,
    queryFn: () => fetchAdminNotifications(),
    enabled,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: markAdminNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNotificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminUnreadCountQueryKey });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAdminNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNotificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminUnreadCountQueryKey });
    },
  });

  return {
    unreadCount: unreadCountQuery.data ?? 0,
    notifications: notificationsQuery.data ?? [],
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    markAsRead: (id: string) => markReadMutation.mutate(id),
    markAllAsRead: () => markAllReadMutation.mutate(),
    refresh: () => {
      void queryClient.invalidateQueries({ queryKey: adminNotificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminUnreadCountQueryKey });
    },
  };
}
