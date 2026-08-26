import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import ApprovalsPage from "#pages/approvals/ApprovalsPage";
import ApprovalDetailsPage from "#pages/approvals/ApprovalDetailsPage";

export const approvalsRoutes: RouteObject[] = [
  {
    path: "approvals",
    element: (
      <AuthorizedRoute capability="approval.review">
        <ApprovalsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "approvals/:approvalId",
    element: (
      <AuthorizedRoute capability="approval.review">
        <ApprovalDetailsPage />
      </AuthorizedRoute>
    ),
  },
];
