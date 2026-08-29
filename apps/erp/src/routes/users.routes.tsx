import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import UsersPage from "#pages/users/UsersPage";
import UserDetailsPage from "#pages/users/UserDetailsPage";
import RolesPage from "#pages/users/RolesPage";
import RoleCreatePage from "#pages/users/RoleCreatePage";
import RoleEditPage from "#pages/users/RoleEditPage";

export const usersRoutes: RouteObject[] = [
  {
    path: "users",
    element: (
      <AuthorizedRoute capability="user.manage">
        <UsersPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "users/:userId",
    element: (
      <AuthorizedRoute capability="user.manage">
        <UserDetailsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "roles",
    element: (
      <AuthorizedRoute capability="role.manage">
        <RolesPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "roles/new",
    element: (
      <AuthorizedRoute capability="role.manage">
        <RoleCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "roles/:roleId/edit",
    element: (
      <AuthorizedRoute capability="role.manage">
        <RoleEditPage />
      </AuthorizedRoute>
    ),
  },
];
