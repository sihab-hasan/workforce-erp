import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { cn } from "@workforce-erp/ui/lib/utils";
import {
  authenticationApi,
  toAuthSession,
  type VerificationChallengePayload,
} from "#features/authentication/api/authentication.api";
import { AUTH_PATHS } from "#features/authentication/navigation";

export interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
  onVerificationRequired?: (challenge: VerificationChallengePayload) => void;
}

export function LoginForm({ className, onSuccess, onVerificationRequired }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter your work email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticationApi.login(normalizedEmail, password);
      if (response.status === "verification_required") {
        onVerificationRequired?.(response.challenge);
        return;
      }
      signIn(toAuthSession(response));
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-in could not be completed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-5", className)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Work email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            className="pl-8"
            aria-required="true"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="login-password">Password</Label>
          <Link
            to={AUTH_PATHS.forgotPassword}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            className="px-8"
            aria-required="true"
            disabled={isLoading}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
