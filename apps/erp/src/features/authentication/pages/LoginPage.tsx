import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AUTH_PATHS, safeReturnTo } from "#features/authentication/navigation";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { LoginForm } from "#features/authentication/components/LoginForm";
import { SocialLoginButtons } from "#features/authentication/components/SocialLoginButtons";
import { ERP_PATHS } from "#routes/paths";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const resetSucceeded = searchParams.get("reset") === "success";
  const passwordChanged = searchParams.get("passwordChanged") === "success";
  const returnQuery =
    returnTo !== ERP_PATHS.tenantSelect ? `&returnTo=${encodeURIComponent(returnTo)}` : "";

  return (
    <AuthCard
      heading="Welcome back"
      subheading="Sign in to securely access your Workforce ERP workspace."
      footer={
        <>
          New organization?{" "}
          <Link
            to={AUTH_PATHS.signUp}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an organization
          </Link>
        </>
      }
    >
      {(resetSucceeded || passwordChanged) && (
        <div
          role="status"
          className="mb-5 flex gap-2.5 rounded-md border border-border bg-muted/40 p-3 text-sm"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            {passwordChanged
              ? "Password updated. Sign in again."
              : "Password reset. Sign in with your new password."}
          </p>
        </div>
      )}

      <LoginForm
        onSuccess={() => navigate(returnTo, { replace: true })}
        onVerificationRequired={(challenge) =>
          navigate(
            `${AUTH_PATHS.verifySignIn}?challenge=${encodeURIComponent(challenge.id)}&methods=${encodeURIComponent(challenge.available_methods.join(","))}${returnQuery}`,
            {
              replace: true,
            },
          )
        }
      />

      <div className="relative my-4 flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SocialLoginButtons action="Continue" returnTo={returnTo} />
    </AuthCard>
  );
}
