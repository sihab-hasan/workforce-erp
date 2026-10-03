import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "#features/erp-core/api";
import { isRealtimeEnabled, subscribeToNotifications } from "#lib/realtime";

// Prefix of the key NotificationsPage already uses, so invalidating it refreshes
// the inbox list and the header badge together.
const notificationsKey = ["notifications"] as const;
const unreadCountKey = ["notifications", "unread-count"] as const;

const POLLING_INTERVAL_MS = 20_000;
const REALTIME_BACKSTOP_MS = 120_000;

/**
 * Unread notification count for the header bell. Polls on its own, and switches
 * to websocket-driven refresh with a slow backstop once broadcasting is enabled.
 */
export function useUnreadNotificationCount(userId: string | undefined, enabled: boolean): number {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: unreadCountKey,
    queryFn: () => apiGet<{ count: number }>("/api/v1/notifications/unread-count"),
    enabled,
    refetchInterval: isRealtimeEnabled() ? REALTIME_BACKSTOP_MS : POLLING_INTERVAL_MS,
  });

  useEffect(() => {
    if (!enabled || !userId) return;

    return subscribeToNotifications(userId, () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKey });
    });
  }, [enabled, userId, queryClient]);

  return query.data?.count ?? 0;
}
