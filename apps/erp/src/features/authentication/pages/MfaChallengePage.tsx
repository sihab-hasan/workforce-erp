import { ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_PATHS, safeReturnTo } from "#features/authentication/navigation";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { MfaChallengeForm } from "#features/authentication/components/MfaChallengeForm";
import type { VerificationMethod } from "#features/authentication/api/authentication.api";

export default function MfaChallengePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("challenge")?.trim() ?? "";
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const methods = (searchParams.get("methods") ?? "")
    .split(",")
    .filter(
      (method): method is VerificationMethod =>
        method === "totp" || method === "email" || method === "sms",
    );

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Verify your sign-in"
      subheading="Complete the required verification before a Workforce ERP session is created."
      footer={
        <Link
          to={AUTH_PATHS.login}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Cancel and return to sign in
        </Link>
      }
    >
      {challengeId ? (
        <MfaChallengeForm
          challengeId={challengeId}
          initialMethods={methods}
          onSuccess={() => navigate(returnTo, { replace: true })}
        />
      ) : (
        <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
          This verification request is missing or invalid. Start a new sign-in.
        </p>
      )}
    </AuthCard>
  );
}
