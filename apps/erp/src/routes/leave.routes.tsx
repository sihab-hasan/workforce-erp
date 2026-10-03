import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import LeaveHistoryPage from "#pages/leave/LeaveHistoryPage";
import LeaveRequestCreatePage from "#pages/leave/LeaveRequestCreatePage";
import LeaveRequestDetailsPage from "#pages/leave/LeaveRequestDetailsPage";
import LeaveRequestsPage from "#pages/leave/LeaveRequestsPage";

export const leaveRoutes: RouteObject[] = [
  {
    path: "leave",
    element: (
      <AuthorizedRoute
        anyOf={["leave.view", "leave.create", "leave.request", "leave.approve", "leave.manage"]}
      >
        <LeaveRequestsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "leave/new",
    element: (
      <AuthorizedRoute anyOf={["leave.create", "leave.request", "leave.manage"]}>
        <LeaveRequestCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "leave/history",
    element: (
      <AuthorizedRoute
        anyOf={["leave.view", "leave.create", "leave.request", "leave.approve", "leave.manage"]}
      >
        <LeaveHistoryPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "leave/:leaveRequestId",
    element: (
      <AuthorizedRoute
        anyOf={["leave.view", "leave.create", "leave.request", "leave.approve", "leave.manage"]}
      >
        <LeaveRequestDetailsPage />
      </AuthorizedRoute>
    ),
  },
];
