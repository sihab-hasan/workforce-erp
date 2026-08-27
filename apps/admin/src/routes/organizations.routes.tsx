import type { RouteObject } from "react-router-dom";
import OrganizationsPage from "#pages/organizations/OrganizationsPage";
import OrganizationDetailsPage from "#pages/organizations/OrganizationDetailsPage";
import OrganizationEditPage from "#pages/organizations/OrganizationEditPage";
export const organizationRoutes: RouteObject[] = [
  { path: "organizations", element: <OrganizationsPage /> },
  { path: "organizations/:organizationId", element: <OrganizationDetailsPage /> },
  { path: "organizations/:organizationId/edit", element: <OrganizationEditPage /> },
];
