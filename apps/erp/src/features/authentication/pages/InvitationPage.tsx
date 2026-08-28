import { useEffect, useState, type FormEvent } from "react";
import { Building2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import {
  authenticationApi,
  toAuthSession,
  type InvitationPreview,
} from "#features/authentication/api/authentication.api";
import { AUTH_PATHS } from "#features/authentication/navigation";
import { tenantRoutes } from "#routes/paths";

export default function InvitationPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setError("Invitation token is missing.");
      setLoading(false);
      return;
    }
    void authenticationApi
      .invitation(token)
      .then((response) => {
        if (!cancelled) setPreview(response.data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Invitation is invalid or expired.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept(event: FormEvent) {
    event.preventDefault();
    if (!preview || loading) return;
    if (preview.identity_setup_required && (password.length < 12 || password !== confirm)) {
      setError("Use a 12+ character password and matching confirmation.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authenticationApi.acceptInvitation(
        token,
        preview.identity_setup_required ? { password, password_confirmation: confirm } : {},
      );
      const returnTo = tenantRoutes.selectCompany(response.organization.slug);
      if (response.status === "verification_required") {
        const methods = response.challenge.available_methods.join(",");
        navigate(
          `${AUTH_PATHS.verifySignIn}?challenge=${encodeURIComponent(response.challenge.id)}&methods=${encodeURIComponent(methods)}&returnTo=${encodeURIComponent(returnTo)}`,
          { replace: true },
        );
        return;
      }
      signIn(toAuthSession(response));
      navigate(returnTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invitation could not be accepted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      icon={<Building2 className="size-6" />}
      heading="Accept organization invitation"
      subheading="This invitation is bound to one organization, one email address, and one membership."
      footer={
        <Link className="font-medium text-primary hover:underline" to={AUTH_PATHS.login}>
          Sign in
        </Link>
      }
    >
      {loading && !preview ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : error && !preview ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : preview ? (
        <form className="space-y-4" onSubmit={accept}>
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">{preview.organization.name}</p>
            <p className="text-muted-foreground">{preview.email}</p>
          </div>
          {!preview.identity_setup_required && !isAuthenticated ? (
            <div className="rounded-md bg-muted p-3 text-sm">
              Sign in with the invited email address first, then return to this invitation.
            </div>
          ) : null}
          {preview.identity_setup_required ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="invite-password">Create password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="invite-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="12+ character password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-8"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-confirm">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="invite-confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-8"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            className="w-full"
            type="submit"
            disabled={loading || (!preview.identity_setup_required && !isAuthenticated)}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Accepting…
              </>
            ) : (
              "Accept invitation"
            )}
          </Button>
        </form>
      ) : null}
    </AuthCard>
  );
}
