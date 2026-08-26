import { useRef, useState, type FormEvent, type KeyboardEvent, type ClipboardEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { env } from "#config/env";
import { apiClient } from "#lib/api";
import { isAdminUser, toAdminSession } from "#features/authentication/admin-auth";
import { ADMIN_PATHS } from "#routes/paths";

type LoginMode = "password" | "otp";
const CODE_LENGTH = 6;

export function SignInPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [requested, setRequested] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");

  if (session) return <Navigate to={ADMIN_PATHS.dashboard} replace />;

  async function accept(response: Awaited<ReturnType<typeof apiClient.login>>) {
    if (!isAdminUser(response.user)) {
      await apiClient.logout().catch(() => undefined);
      throw new Error("This account does not have admin application access.");
    }

    await signIn(toAdminSession(response.user));
    const from = (location.state as { from?: string } | null)?.from;
    navigate(
      from?.startsWith(`${ADMIN_PATHS.root}/`) || from === ADMIN_PATHS.root
        ? from
        : ADMIN_PATHS.dashboard,
      { replace: true },
    );
  }

  function resetFeedback() {
    setError(null);
    setMessage(null);
  }

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setRequested(false);
    setDigits(Array(CODE_LENGTH).fill(""));
    resetFeedback();
  }

  async function requestCode() {
    if (!email.trim()) {
      setError("Enter your account email first.");
      return;
    }

    setIsLoading(true);
    resetFeedback();
    try {
      const response = await apiClient.requestOtp(email.trim());
      setRequested(true);
      setMessage(
        response.message ??
          "If the account is eligible, a 6-digit sign-in code will arrive shortly.",
      );
      window.setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "We couldn’t send a one-time code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();

    if (!email.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "otp" && !requested) {
      await requestCode();
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "password") {
        if (!password.trim()) throw new Error("Please fill in all fields.");
        await accept(await apiClient.login(email.trim(), password));
      } else {
        if (code.length !== CODE_LENGTH) throw new Error("Please enter all 6 digits.");
        await accept(await apiClient.verifyOtp(email.trim(), code));
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : "Sign in failed.");
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
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("") as string[];
    pasted.split("").forEach((character, index) => {
      next[index] = character;
    });
    setDigits(next);
    inputRefs.current[Math.min(Math.max(pasted.length - 1, 0), CODE_LENGTH - 1)]?.focus();
  }

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Welcome back"
      subheading="Sign in to securely access Workforce ERP platform administration."
      footer={
        mode === "password" ? (
          <>
            Need passwordless access?{" "}
            <button
              type="button"
              onClick={() => switchMode("otp")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in with a one-time code
            </button>
          </>
        ) : (
          <>
            Prefer your password?{" "}
            <button
              type="button"
              onClick={() => switchMode("password")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in with password
            </button>
          </>
        )
      }
    >
      <form id="admin-login-form" onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setRequested(false);
                setDigits(Array(CODE_LENGTH).fill(""));
                resetFeedback();
              }}
              className="pl-8"
              aria-required="true"
              disabled={isLoading}
            />
          </div>
          {mode === "otp" ? (
            <p className="text-xs leading-5 text-muted-foreground">
              We’ll send the code to the email associated with your account.
            </p>
          ) : null}
        </div>

        {mode === "password" ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="admin-password">Password</Label>
              <a
                href={`${env.portalUrl}/auth/forgot-password`}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError(null);
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
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        ) : requested ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label>Verification code</Label>
              <span className="text-xs text-muted-foreground">6 digits</span>
            </div>
            <div
              className="flex w-full justify-center gap-2"
              role="group"
              aria-label="One-time code"
            >
              {digits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1}`}
                  disabled={isLoading}
                  className="h-11 w-10 text-center text-lg font-semibold tracking-widest"
                />
              ))}
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="flex gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>{message}</p>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="-mt-1 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={isLoading || (mode === "otp" && requested && code.length !== CODE_LENGTH)}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              {mode === "otp" ? (requested ? "Verifying code…" : "Sending code…") : "Signing in…"}
            </>
          ) : mode === "otp" ? (
            requested ? (
              "Verify code"
            ) : (
              "Send one-time code"
            )
          ) : (
            "Sign in"
          )}
        </Button>

        {mode === "otp" && requested ? (
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
        ) : null}
      </form>
    </AuthCard>
  );
}

export default SignInPage;
