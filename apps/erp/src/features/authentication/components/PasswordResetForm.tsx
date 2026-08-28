import { useState } from "react";
import { Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { cn } from "@workforce-erp/ui/lib/utils";
import { authenticationApi } from "#features/authentication/api/authentication.api";

export interface PasswordResetFormProps {
  email: string;
  token: string;
  className?: string;
  onSuccess?: () => void;
}

export function PasswordResetForm({ email, token, className, onSuccess }: PasswordResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!password || !confirm) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 12) {
      setError("Use a password or passphrase of at least 12 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authenticationApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: confirm,
      });
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t reset your password. Please request a new reset link.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function strengthScore(pw: string): number {
    if (pw.length >= 24) return 4;
    if (pw.length >= 18) return 3;
    if (pw.length >= 14) return 2;
    if (pw.length >= 12) return 1;
    return 0;
  }

  const score = strengthScore(password);
  const strengthLabel = ["", "Acceptable", "Good", "Strong", "Very strong"][score] ?? "";
  const strengthColor = ["", "bg-amber-500", "bg-yellow-400", "bg-primary", "bg-primary"][score];
  const passwordsMatch = confirm.length > 0 && confirm === password;

  return (
    <form
      id="reset-password-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      <div className="rounded-md bg-muted/50 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
        Resetting the password for <span className="font-medium text-foreground">{email}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password">New password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-8"
            aria-required="true"
            aria-describedby="password-requirements password-strength"
            disabled={isLoading}
          />
          <button
            type="button"
            id="reset-toggle-password"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <p id="password-requirements" className="text-xs leading-5 text-muted-foreground">
          Use a password or passphrase of at least 12 characters. Password managers and paste are
          supported.
        </p>

        {password.length > 0 && (
          <div id="password-strength" className="flex items-center gap-2">
            <div className="flex h-1 flex-1 gap-0.5 overflow-hidden rounded-full bg-border">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-full flex-1 rounded-full transition-all",
                    step <= score ? strengthColor : "bg-border",
                  )}
                />
              ))}
            </div>
            <span className="w-12 text-right text-xs font-medium text-muted-foreground">
              {strengthLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password-confirm">Confirm password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reset-password-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="px-8"
            aria-required="true"
            aria-invalid={confirm.length > 0 && confirm !== password ? true : undefined}
            aria-describedby={passwordsMatch ? "password-match-status" : undefined}
            disabled={isLoading}
          />
          <button
            type="button"
            id="reset-toggle-confirm"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {passwordsMatch && (
          <p id="password-match-status" className="flex items-center gap-1.5 text-xs text-primary">
            <Check className="size-3.5" /> Passwords match
          </p>
        )}
      </div>

      {error && (
        <p
          id="reset-password-error"
          role="alert"
          className="-mt-1 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        id="reset-password-submit"
        size="lg"
        className="mt-1 w-full"
        disabled={isLoading || password.length < 12 || password !== confirm}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Updating password…
          </>
        ) : (
          "Set new password"
        )}
      </Button>
    </form>
  );
}
