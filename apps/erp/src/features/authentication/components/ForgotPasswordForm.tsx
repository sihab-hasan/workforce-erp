import { useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { cn } from "@workforce-erp/ui/lib/utils";
import { authenticationApi } from "#features/authentication/api/authentication.api";

export interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await authenticationApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t start the password reset. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        id="forgot-password-success"
        className={cn("flex flex-col items-center gap-4 py-2 text-center", className)}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-foreground">Check your inbox</p>
          <p className="text-xs leading-5 text-muted-foreground">
            If an eligible account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, we’ll send a secure
            password-reset link shortly.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Didn’t receive it? Check your spam folder or try another email address.
          </p>
        </div>
        <button
          id="forgot-password-try-again"
          type="button"
          onClick={() => {
            setSent(false);
            setError(null);
          }}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form
      id="forgot-password-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8"
            aria-required="true"
            aria-describedby="forgot-email-help"
            disabled={isLoading}
          />
        </div>
        <p id="forgot-email-help" className="text-xs leading-5 text-muted-foreground">
          Use the email address assigned to your Workforce ERP account.
        </p>
      </div>

      {error && (
        <p
          id="forgot-password-error"
          role="alert"
          className="-mt-1 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        id="forgot-password-submit"
        size="lg"
        className="mt-1 w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Sending reset link…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
