import type { RouteObject } from "react-router-dom";
import RolesPage from "#pages/roles/RolesPage";
import CapabilityMatrixPage from "#pages/roles/CapabilityMatrixPage";
import RoleDetailsPage from "#pages/roles/RoleDetailsPage";
export const roleRoutes: RouteObject[] = [
  { path: "roles", element: <RolesPage /> },
  { path: "roles/capabilities", element: <CapabilityMatrixPage /> },
  { path: "roles/:roleId", element: <RoleDetailsPage /> },
];
