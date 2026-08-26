import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import UsersPage from "#pages/users/UsersPage";
import UserDetailsPage from "#pages/users/UserDetailsPage";
import RolesPage from "#pages/users/RolesPage";

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
];
