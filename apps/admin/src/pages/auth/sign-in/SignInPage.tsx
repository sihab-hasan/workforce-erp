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
  const state = loc.state as { returnTo?: string; from?: string } | null;
  const rawReturnTo = state?.returnTo || state?.from || ADMIN_PATHS.dashboard;
  const returnTo = rawReturnTo.startsWith("/admin")
    ? rawReturnTo.replace(/^\/admin/, "") || "/"
    : rawReturnTo;

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
      <form className="space-y-4" onSubmit={login}>
        <div className="space-y-1.5">
          <Label htmlFor="admin-email" className="text-xs font-semibold text-foreground/90">
            Work Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-email"
              className="h-10.5 rounded-xl border-border/80 bg-background/60 pl-9 text-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              type="email"
              autoComplete="email"
              placeholder="admin@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin-password" className="text-xs font-semibold text-foreground/90">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-password"
              className="h-10.5 rounded-xl border-border/80 bg-background/60 px-9 text-sm transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
          >
            <span className="size-1.5 rounded-full bg-destructive shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          className="mt-2 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
export default SignInPage;
