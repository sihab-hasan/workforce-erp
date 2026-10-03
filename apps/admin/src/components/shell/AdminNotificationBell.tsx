import { useState } from "react";
import { Bell, CheckCheck, Clock, Mail, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import { useAdminNotifications } from "#features/notifications/hooks/use-admin-notifications";
import { ADMIN_PATHS } from "#routes/paths";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch {
    return "";
  }
}

export function AdminNotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useAdminNotifications(true);

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    setOpen(false);

    if (item.action_url) {
      navigate(item.action_url);
    } else if (item.type === "contact.inquiry") {
      navigate(ADMIN_PATHS.inquiries);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <div className="relative inline-flex">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="size-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                </span>
              )}
            </Button>
            {unreadCount > 0 && (
              <span className="pointer-events-none absolute -top-1 -right-1 flex min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 py-0.2 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        }
      />
      <DropdownMenuContent align="end" className="w-84 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/60">
                <Bell className="size-5" />
              </div>
              <p className="mt-3 text-xs font-medium">No notifications yet</p>
              <p className="text-[11px] text-muted-foreground/70">
                New contact inquiries and platform alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.slice(0, 8).map((item) => {
              const isUnread = !item.is_read;
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex cursor-pointer gap-3 p-3.5 transition-colors hover:bg-muted/50 ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      isUnread ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.type === "contact.inquiry" ? (
                      <MessageSquare className="size-4" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`truncate text-xs font-semibold ${
                          isUnread ? "text-foreground font-bold" : "text-foreground/80"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    {item.message && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {item.message}
                      </p>
                    )}
                  </div>

                  {isUnread && <span className="my-auto size-2 shrink-0 rounded-full bg-primary" />}
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <div className="p-1.5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(ADMIN_PATHS.inquiries);
            }}
            className="flex w-full items-center justify-center rounded-md py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            View All Contact Inquiries
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
