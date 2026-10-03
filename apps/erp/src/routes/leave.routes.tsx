import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import LeaveRequestsPage from "#pages/leave/LeaveRequestsPage";
import LeaveRequestCreatePage from "#pages/leave/LeaveRequestCreatePage";
import LeaveHistoryPage from "#pages/leave/LeaveHistoryPage";
import LeaveRequestDetailsPage from "#pages/leave/LeaveRequestDetailsPage";

export const leaveRoutes: RouteObject[] = [
  {
    path: "leave",
    element: (
      <AuthorizedRoute capability="leave.view">
        <LeaveRequestsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "leave/new",
    element: (
      <AuthorizedRoute capability="leave.view">
        <LeaveRequestCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "leave/history",
    element: (
      <AuthorizedRoute capability="leave.view">
        <LeaveHistoryPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "leave/:leaveRequestId",
    element: (
      <AuthorizedRoute capability="leave.view">
        <LeaveRequestDetailsPage />
      </AuthorizedRoute>
    ),
  },
];
