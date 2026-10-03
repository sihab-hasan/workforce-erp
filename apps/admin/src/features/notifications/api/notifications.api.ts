import { cookieApiClient } from "#lib/api";
import type { AdminNotification, AdminUnreadCountResponse } from "../types/notifications.types";

export interface NotificationsListResponse {
  data: AdminNotification[];
  current_page: number;
  last_page: number;
  total: number;
}

export async function fetchAdminNotifications(
  status?: "unread" | "all",
): Promise<AdminNotification[]> {
  const query = status === "unread" ? "?status=unread" : "";
  const res = await cookieApiClient.get<{
    success: boolean;
    data:
      | {
          data: AdminNotification[];
        }
      | AdminNotification[];
  }>(`/api/v1/platform/notifications${query}`);

  if (Array.isArray(res?.data)) {
    return res.data;
  }
  return res?.data?.data ?? [];
}

export async function fetchAdminUnreadCount(): Promise<number> {
  const res = await cookieApiClient.get<{
    success: boolean;
    data: AdminUnreadCountResponse;
  }>("/api/v1/platform/notifications/unread-count");

  return res?.data?.count ?? 0;
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  await cookieApiClient.patch(`/api/v1/platform/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await cookieApiClient.patch("/api/v1/platform/notifications/read-all");
}
