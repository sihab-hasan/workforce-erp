import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { env } from "#config/env";
import { apiClient, type AdminChallenge, type VerificationMethod } from "#lib/api";
import { toAdminSession } from "#features/authentication/admin-auth";
import { ADMIN_PATHS } from "#routes/paths";
const methodLabels: Record<VerificationMethod, string> = {
  totp: "Authenticator App",
  email: "Email Code",
  sms: "SMS Code",
};
export function SignInPage() {
  const { session, signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [challenge, setChallenge] = useState<AdminChallenge | null>(null);
  const [method, setMethod] = useState<VerificationMethod | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (session) return <Navigate to={ADMIN_PATHS.dashboard} replace />;
  const returnTo =
    typeof (loc.state as { returnTo?: unknown } | null)?.returnTo === "string"
      ? (loc.state as { returnTo: string }).returnTo
      : ADMIN_PATHS.dashboard;
  async function login(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await apiClient.login(email.trim().toLowerCase(), password);
      if (r.status === "verification_required") {
        setChallenge(r.challenge);
        setMethod(r.challenge.selected_method);
        return;
      }
      const c = await apiClient.platformContext();
      signIn(toAdminSession(c.data));
      nav(returnTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }
  async function choose(next: VerificationMethod) {
    if (!challenge) return;
    setLoading(true);
    setError(null);
    try {
      const r = await apiClient.selectChallengeMethod(challenge.id, next);
      setChallenge(r.challenge);
      setMethod(next);
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification method unavailable.");
    } finally {
      setLoading(false);
    }
  }
  async function verify(e: FormEvent) {
    e.preventDefault();
    if (!challenge || !/^\d{6}$/.test(code) || loading) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.verifyChallenge(challenge.id, code);
      const c = await apiClient.platformContext();
      signIn(toAdminSession(c.data));
      nav(returnTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
      setCode("");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading={challenge ? "Verify administrator sign-in" : "Platform administration"}
      subheading={
        challenge
          ? "Privileged access requires a current verification factor."
          : "Sign in to the separate Workforce ERP platform administration console."
      }
      footer={
        !challenge ? (
          <a
            href={`${env.portalUrl}/forgot-password`}
            className="font-medium text-primary hover:underline"
          >
            Forgot password?
          </a>
        ) : null
      }
    >
      {challenge ? (
        <form className="space-y-5" onSubmit={verify}>
          <div className="grid gap-2">
            {challenge.available_methods.map((m) => (
              <Button
                key={m}
                type="button"
                variant={method === m ? "default" : "outline"}
                onClick={() => void choose(m)}
                disabled={loading}
              >
                {methodLabels[m]}
              </Button>
            ))}
          </div>
          {method ? (
            <div className="space-y-1.5">
              <Label htmlFor="admin-code">6-digit {methodLabels[method]} code</Label>
              <Input
                id="admin-code"
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              {method !== "totp" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => challenge && void apiClient.resendChallenge(challenge.id)}
                >
                  Resend code
                </Button>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={loading || !method || code.length !== 6}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Verifying…
              </>
            ) : (
              "Verify & continue"
            )}
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={login}>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Work email</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-email"
                className="pl-8"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-password"
                className="px-8"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
export default SignInPage;
