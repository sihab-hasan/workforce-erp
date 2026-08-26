import { KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

import { AUTH_PATHS } from "#features/authentication/navigation.ts";
import { AuthCard } from "#features/authentication/components/AuthCard.tsx";
import { ForgotPasswordForm } from "#features/authentication/components/ForgotPasswordForm.tsx";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      icon={<KeyRound className="size-6" />}
      heading="Reset your password"
      subheading="Enter the email associated with your account and we’ll send password-reset instructions."
      footer={
        <Link
          to={AUTH_PATHS.login}
          id="back-to-login-link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
