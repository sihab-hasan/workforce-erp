import { Bell } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { useAuth } from "@workforce-erp/auth";
import { companyRoutes } from "#routes/paths";
import { useUnreadNotificationCount } from "#features/notifications/hooks/use-unread-notification-count";

const MAX_BADGE_COUNT = 99;

export function NotificationBell() {
  const navigate = useNavigate();
  const { tenantKey, companyKey } = useParams();
  const { session } = useAuth();
  const unreadCount = useUnreadNotificationCount(session?.user.id, Boolean(tenantKey));
  const badgeLabel = unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(unreadCount);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        onClick={() =>
          tenantKey && companyKey && navigate(companyRoutes.notifications(tenantKey, companyKey))
        }
      >
        <Bell aria-hidden="true" />
      </Button>
      {unreadCount > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 flex min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-destructive-foreground"
        >
          {badgeLabel}
        </span>
      ) : null}
    </div>
  );
}
