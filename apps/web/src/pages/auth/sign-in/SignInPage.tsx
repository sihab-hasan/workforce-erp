import { useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { AuthCard } from "#features/authentication/components/AuthCard";
import { env } from "#config/env";

/**
 * Authentication is owned by the ERP application. Keep the public application's
 * sign-in entry visually identical to the big auth shell, then hand off to the
 * canonical ERP authentication route.
 */
export function SignInPage() {
  const destination = `${env.erpUrl}/sign-in${window.location.search}`;

  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Welcome back"
      subheading="Sign in to securely access your Workforce ERP workspace."
    >
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-3 py-5 text-center"
      >
        <Loader2 className="size-6 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">Opening secure sign-in…</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            You’re being connected to the Workforce ERP authentication workspace.
          </p>
        </div>
        <a
          href={destination}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Continue to sign in
        </a>
      </div>
    </AuthCard>
  );
}

export default SignInPage;
