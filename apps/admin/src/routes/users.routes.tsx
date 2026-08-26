import type { RouteObject } from "react-router-dom";
import UsersPage from "#pages/users/UsersPage";
import UserCreatePage from "#pages/users/UserCreatePage";
import UserDetailsPage from "#pages/users/UserDetailsPage";
import UserEditPage from "#pages/users/UserEditPage";
export const userRoutes: RouteObject[] = [
  { path: "users", element: <UsersPage /> },
  { path: "users/new", element: <UserCreatePage /> },
  { path: "users/:userId", element: <UserDetailsPage /> },
  { path: "users/:userId/edit", element: <UserEditPage /> },
];
