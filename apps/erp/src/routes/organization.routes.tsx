import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import OrganizationPage from "#pages/organization/OrganizationPage";
import OrganizationEditPage from "#pages/organization/OrganizationEditPage";

export const organizationRoutes: RouteObject[] = [
  {
    path: "organization",
    element: (
      <AuthorizedRoute capability="organization.manage">
        <OrganizationPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "organization/edit",
    element: (
      <AuthorizedRoute capability="organization.manage">
        <OrganizationEditPage />
      </AuthorizedRoute>
    ),
  },
];
