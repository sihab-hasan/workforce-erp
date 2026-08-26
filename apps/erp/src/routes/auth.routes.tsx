import { Navigate, type RouteObject } from "react-router-dom";
import { AuthLayout } from "#layouts/AuthLayout";
import SignInPage from "#pages/auth/sign-in/SignInPage";
import ForgotPasswordPage from "#features/authentication/pages/ForgotPasswordPage";
import MfaChallengePage from "#features/authentication/pages/MfaChallengePage";
import ResetPasswordPage from "#features/authentication/pages/ResetPasswordPage";
import SsoCallbackPage from "#features/authentication/pages/SsoCallbackPage";
import { SignOutFeature } from "#features/authentication/sign-out";
import { AnonymousOnly } from "#features/authentication/route-guards";
import { ERP_PATHS } from "#routes/paths";

export const authRoutes: RouteObject[] = [
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="sign-in" replace /> },
      {
        path: "sign-in",
        element: (
          <AnonymousOnly>
            <SignInPage />
          </AnonymousOnly>
        ),
      },
      { path: "login", element: <Navigate to={ERP_PATHS.signIn} replace /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      {
        path: "mfa",
        element: (
          <AnonymousOnly>
            <MfaChallengePage />
          </AnonymousOnly>
        ),
      },
      {
        path: "callback/:provider",
        element: (
          <AnonymousOnly>
            <SsoCallbackPage />
          </AnonymousOnly>
        ),
      },
      { path: "sign-out", element: <SignOutFeature /> },
      { path: "*", element: <Navigate to={ERP_PATHS.signIn} replace /> },
    ],
  },
  { path: "login", element: <Navigate to={ERP_PATHS.signIn} replace /> },
];
