import type { RouteObject } from "react-router-dom";
import { AuthLayout } from "#layouts/AuthLayout";
import SignInPage from "#pages/auth/sign-in/SignInPage";
import { AdminAnonymousOnly } from "#features/authentication/route-guards";
export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "sign-in",
        element: (
          <AdminAnonymousOnly>
            <SignInPage />
          </AdminAnonymousOnly>
        ),
      },
    ],
  },
];
