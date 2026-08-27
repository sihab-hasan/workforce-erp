import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useAuth } from "@workforce-erp/auth";

import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { cn } from "@workforce-erp/ui/lib/utils";
import { authenticationApi, toAuthSession } from "#features/authentication/api/authentication.api";

const CODE_LENGTH = 6;

export interface MfaChallengeFormProps {
  className?: string;
  initialEmail?: string;
  onSuccess?: () => void;
}

export function MfaChallengeForm({
  className,
  initialEmail = "",
  onSuccess,
}: MfaChallengeFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [requested, setRequested] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { signIn } = useAuth();
  const code = digits.join("");

  async function requestCode() {
    if (!email.trim()) {
      setError("Enter your account email first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await authenticationApi.requestOtp(email.trim());
      setRequested(true);
      setMessage(
        response.message ??
          "If the account is eligible, a 6-digit sign-in code will arrive shortly.",
      );
      window.setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn’t send a one-time code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("") as string[];

    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });

    setDigits(next);
    inputRefs.current[Math.min(Math.max(pasted.length - 1, 0), CODE_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!requested) {
      await requestCode();
      return;
    }

    if (code.length !== CODE_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticationApi.verifyOtp(email.trim(), code);
      signIn(toAuthSession(response));
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The one-time code could not be verified. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      id="mfa-challenge-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="otp-email">Account email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="otp-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setRequested(false);
              setDigits(Array(CODE_LENGTH).fill(""));
              setMessage(null);
              setError(null);
            }}
            placeholder="you@company.com"
            className="pl-8"
            aria-required="true"
            aria-describedby="otp-email-help"
            disabled={isLoading}
          />
        </div>
        <p id="otp-email-help" className="text-xs leading-5 text-muted-foreground">
          We’ll send the code to the email associated with your account.
        </p>
      </div>

      {requested && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <Label>Verification code</Label>
            <span className="text-xs text-muted-foreground">6 digits</span>
          </div>
          <div className="flex w-full justify-center gap-2" role="group" aria-label="One-time code">
            {digits.map((digit, index) => (
              <Input
                key={index}
                id={`mfa-digit-${index}`}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => updateDigit(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                aria-label={`Digit ${index + 1}`}
                disabled={isLoading}
                className="h-11 w-10 text-center text-lg font-semibold tracking-widest"
              />
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className="flex gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <p
          id="mfa-error"
          role="alert"
          className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        id="mfa-submit-button"
        size="lg"
        className="w-full"
        disabled={isLoading || (requested && code.length !== CODE_LENGTH)}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            {requested ? "Verifying code…" : "Sending code…"}
          </>
        ) : requested ? (
          "Verify code"
        ) : (
          "Send one-time code"
        )}
      </Button>

      {requested && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void requestCode()}
            disabled={isLoading}
          >
            Resend code
          </Button>
        </div>
      )}
    </form>
  );
}
