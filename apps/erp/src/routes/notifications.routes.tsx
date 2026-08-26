import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import NotificationsPage from "#pages/notifications/NotificationsPage";

export const notificationsRoutes: RouteObject[] = [
  {
    path: "notifications",
    element: (
      <AuthorizedRoute capability="notification.view">
        <NotificationsPage />
      </AuthorizedRoute>
    ),
  },
];
