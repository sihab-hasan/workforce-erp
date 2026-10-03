import { useState } from "react";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@workforce-erp/ui/components/input-otp";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { authenticationApi, toAuthSession } from "#features/authentication/api/authentication.api";
import { AUTH_PATHS } from "#features/authentication/navigation";
import { ERP_PATHS } from "#routes/paths";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const challengeId = params.get("challenge")?.trim() ?? "";
  const [code, setCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event?: React.FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    if (!challengeId || !/^\d{6}$/.test(code) || loading || isSuccess) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authenticationApi.verifyRegistration(challengeId, code);
      const tenant = response.organization.slug;
      sessionStorage.setItem("workforce-erp.onboarding.tenant", tenant);
      const onboardingPath = `${ERP_PATHS.onboarding}?tenant=${encodeURIComponent(tenant)}`;
      signIn(toAuthSession(response));
      setIsSuccess(true);
      setTimeout(() => {
        navigate(onboardingPath, { replace: true });
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Email verification could not be completed.",
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!challengeId || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authenticationApi.resendRegistration(challengeId);
      setMessage(response.message ?? "A new verification code was requested.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "A new code cannot be sent yet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      icon={<MailCheck className="size-6" />}
      heading="Verify your work email"
      subheading="Enter the single-use 6-digit code sent for this organization registration."
      footer={
        <Link
          to={AUTH_PATHS.signUp}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Start registration again
        </Link>
      }
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 ring-4 ring-emerald-500/10">
            <CheckCircle2 className="size-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Email verified successfully</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Setting up your organization workspace…
            </p>
          </div>
          <Loader2 className="mt-2 size-5 animate-spin text-primary" />
        </div>
      ) : challengeId ? (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="flex flex-col items-center gap-3">
            <Label htmlFor="registration-code">Email verification code</Label>
            <InputOTP
              id="registration-code"
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                setError(null);
              }}
              disabled={loading}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {message ? (
            <p
              role="status"
              className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
            >
              {message}
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? <Loader2 className="animate-spin" /> : null} Verify email & continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={loading}
            onClick={() => void resend()}
          >
            Resend code
          </Button>
        </form>
      ) : (
        <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Registration challenge is missing. Start registration again.
        </p>
      )}
    </AuthCard>
  );
}
