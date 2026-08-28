import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { AuthLayout } from "#layouts/AuthLayout";
import SignInPage from "#pages/auth/sign-in/SignInPage";
import ForgotPasswordPage from "#features/authentication/pages/ForgotPasswordPage";
import InvitationPage from "#features/authentication/pages/InvitationPage";
import MfaChallengePage from "#features/authentication/pages/MfaChallengePage";
import ResetPasswordPage from "#features/authentication/pages/ResetPasswordPage";
import SignUpPage from "#features/authentication/pages/SignUpPage";
import SsoCallbackPage from "#features/authentication/pages/SsoCallbackPage";
import VerifyEmailPage from "#features/authentication/pages/VerifyEmailPage";
import VerifyPhonePage from "#features/authentication/pages/VerifyPhonePage";
import OnboardingPage from "#features/authentication/pages/OnboardingPage";
import { SignOutFeature } from "#features/authentication/sign-out";
import { AnonymousOnly, ProtectedRoute } from "#features/authentication/route-guards";

const anonymous = (element: ReactNode) => <AnonymousOnly>{element}</AnonymousOnly>;
export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: "sign-in", element: anonymous(<SignInPage />) },
      { path: "sign-up", element: anonymous(<SignUpPage />) },
      { path: "verify-email", element: anonymous(<VerifyEmailPage />) },
      { path: "verify-sign-in", element: anonymous(<MfaChallengePage />) },
      { path: "forgot-password", element: anonymous(<ForgotPasswordPage />) },
      { path: "reset-password", element: anonymous(<ResetPasswordPage />) },
      { path: "sso/callback/:provider", element: anonymous(<SsoCallbackPage />) },
      { path: "accept-invitation/:token", element: <InvitationPage /> },
      {
        path: "verify-phone",
        element: (
          <ProtectedRoute>
            <VerifyPhonePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "sign-out",
    element: (
      <ProtectedRoute>
        <SignOutFeature />
      </ProtectedRoute>
    ),
  },
  {
    path: "onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  ...[
    "organization",
    "company",
    "locations",
    "departments",
    "settings",
    "modules",
    "team",
    "security",
    "complete",
  ].map((step) => ({
    path: `onboarding/${step}`,
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  })),
];
