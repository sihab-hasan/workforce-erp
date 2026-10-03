export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  action_url?: string | null;
  data?: Record<string, unknown>;
  read_at?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AdminUnreadCountResponse {
  count: number;
}
