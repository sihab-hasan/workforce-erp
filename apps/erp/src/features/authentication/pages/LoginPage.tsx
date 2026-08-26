import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AUTH_PATHS, safeReturnTo } from "#features/authentication/navigation.ts";
import { AuthCard } from "#features/authentication/components/AuthCard.tsx";
import { LoginForm } from "#features/authentication/components/LoginForm.tsx";
import { SocialLoginButtons } from "#features/authentication/components/SocialLoginButtons.tsx";
import { ERP_PATHS } from "#routes/paths";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const resetSucceeded = searchParams.get("reset") === "success";
  const passwordChanged = searchParams.get("passwordChanged") === "success";
  const returnQuery =
    returnTo !== ERP_PATHS.tenantSelect ? `?returnTo=${encodeURIComponent(returnTo)}` : "";

  return (
    <AuthCard
      heading="Welcome back"
      subheading="Sign in to securely access your Workforce ERP workspace."
      footer={
        <>
          Need passwordless access?{" "}
          <Link
            to={`${AUTH_PATHS.mfaChallenge}${returnQuery}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in with a one-time code
          </Link>
        </>
      }
    >
      {(resetSucceeded || passwordChanged) && (
        <div
          role="status"
          className="flex gap-2.5 rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            {passwordChanged
              ? "Your password has been updated. Sign in again with your new password."
              : "Your password has been reset. You can now sign in with your new password."}
          </p>
        </div>
      )}

      <div className={resetSucceeded || passwordChanged ? "mt-5" : undefined}>
        <LoginForm onSuccess={() => navigate(returnTo, { replace: true })} />
      </div>

      <div className="relative my-2 flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SocialLoginButtons action="Continue" returnTo={returnTo} />

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        Trouble signing in? Contact your organization administrator for account access support.
      </p>
    </AuthCard>
  );
}
