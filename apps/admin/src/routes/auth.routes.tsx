import { Navigate, type RouteObject } from "react-router-dom";
import { AuthLayout } from "#layouts/AuthLayout";
import SignInPage from "#pages/auth/sign-in/SignInPage";
import { AdminAnonymousOnly } from "#features/authentication/route-guards";
import { ADMIN_PATHS } from "#routes/paths";

export const authRoutes: RouteObject[] = [
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="sign-in" replace /> },
      {
        path: "sign-in",
        element: (
          <AdminAnonymousOnly>
            <SignInPage />
          </AdminAnonymousOnly>
        ),
      },
      { path: "login", element: <Navigate to={ADMIN_PATHS.signIn} replace /> },
      { path: "*", element: <Navigate to={ADMIN_PATHS.signIn} replace /> },
    ],
  },
  { path: "login", element: <Navigate to={ADMIN_PATHS.signIn} replace /> },
];
