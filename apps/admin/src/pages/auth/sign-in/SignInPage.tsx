import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { env } from "#config/env";
import { apiClient } from "#lib/api";
import { toAdminSession } from "#features/authentication/admin-auth";
import { ADMIN_PATHS } from "#routes/paths";
export function SignInPage() {
  const { session, signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
      await apiClient.login(email.trim().toLowerCase(), password);
      const c = await apiClient.platformContext();
      signIn(toAdminSession(c.data));
      nav(returnTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Platform administration"
      subheading="Sign in to the separate Workforce ERP platform administration console."
      footer={
        <a
          href={`${env.portalUrl}/forgot-password`}
          className="font-medium text-primary hover:underline"
        >
          Forgot password?
        </a>
      }
    >
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
    </AuthCard>
  );
}
export default SignInPage;
