import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";

import { AUTH_PATHS } from "#features/authentication/navigation.ts";
import { AuthCard } from "#features/authentication/components/AuthCard.tsx";
import { PasswordResetForm } from "#features/authentication/components/PasswordResetForm.tsx";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";
  const hasResetContext = token.length > 0 && email.length > 0;

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Create a new password"
      subheading="Choose a strong, unique password to protect your Workforce ERP account."
      footer={
        <Link
          to={AUTH_PATHS.login}
          id="reset-back-to-login-link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      }
    >
      {hasResetContext ? (
        <PasswordResetForm
          email={email}
          token={token}
          onSuccess={() => {
            signOut();
            navigate(`${AUTH_PATHS.login}?reset=success`, { replace: true });
          }}
        />
      ) : (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">This reset link can’t be used</p>
            <p role="alert" className="text-sm leading-6 text-muted-foreground">
              This reset link is incomplete. Request a new password reset link.
            </p>
          </div>
          <Link
            to={AUTH_PATHS.forgotPassword}
            className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
