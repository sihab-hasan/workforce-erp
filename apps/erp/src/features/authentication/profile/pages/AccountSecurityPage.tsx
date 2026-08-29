import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Smartphone } from "lucide-react";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@workforce-erp/ui/components/input-otp";
import { Label } from "@workforce-erp/ui/components/label";
import { PasswordChangeForm } from "#features/authentication/profile/components/PasswordChangeForm";
import {
  authenticationApi,
  type AuthContextPayload,
} from "#features/authentication/api/authentication.api";
import { Link, useParams } from "react-router-dom";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";
import { qrSvgDataUri } from "#features/authentication/lib/qr";
import { ErpPage, SectionCard, StatCard, StatusPill } from "#components/erp/ErpPage";

export default function AccountSecurityPage() {
  const { session, signOut } = useAuth();
  const { tenantKey } = useParams();
  const [context, setContext] = useState<AuthContextPayload | null>(null);
  const [factors, setFactors] = useState<
    Array<{ id: string; label: string; confirmed_at: string }>
  >([]);
  const [enroll, setEnroll] = useState<{
    factor_id: string;
    secret: string;
    otpauth_uri: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qr = useMemo(() => (enroll ? qrSvgDataUri(enroll.otpauth_uri) : null), [enroll]);

  const backUrl = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  const load = useCallback(async () => {
    try {
      const [c, f] = await Promise.all([
        authenticationApi.context(tenantKey),
        authenticationApi.authenticators(),
      ]);
      setContext(c.data);
      setFactors(f.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Security settings could not be loaded.");
    }
  }, [tenantKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      const r = await authenticationApi.beginAuthenticator();
      setEnroll(r.data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Recent verification is required before adding an authenticator.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!enroll || !/^[0-9]{6}$/.test(code)) return;
    setBusy(true);
    try {
      await authenticationApi.confirmAuthenticator(enroll.factor_id, code);
      setEnroll(null);
      setCode("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authenticator code is invalid.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await authenticationApi.removeAuthenticator(id);
      signOut();
      window.location.assign(ERP_PATHS.signIn);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authenticator could not be removed.");
      setBusy(false);
    }
  }

  return (
    <ErpPage
      title="Account security"
      description={`Manage password, 2FA authenticator apps, and verification status for ${session?.user.email ?? "your account"}.`}
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to settings
        </Button>
      }
    >
      {/* Top Stat Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="2FA Status"
          value={<StatusPill value={factors.length > 0 ? "enabled" : "optional"} />}
        />
        <StatCard
          label="Email Verification"
          value={<StatusPill value={context?.verification.email ? "verified" : "pending"} />}
        />
        <StatCard
          label="Auth Method"
          value={
            <span className="text-sm font-semibold capitalize">
              {context?.session?.authentication_method ?? "Password"}
            </span>
          }
        />
        <StatCard
          label="Active Factors"
          value={<span className="text-base font-semibold">{factors.length} Enrolled</span>}
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Change Password"
          description="Update your credentials regularly to maintain workspace security"
        >
          <PasswordChangeForm />
        </SectionCard>

        <SectionCard
          title="Authenticator App (TOTP)"
          description="RFC-compatible TOTP for Google Authenticator, 1Password, Microsoft Authenticator"
        >
          <div className="space-y-4">
            {factors.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border p-3.5 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="size-4 text-primary" />
                  <span className="font-medium">{f.label}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={busy}
                  onClick={() => void remove(f.id)}
                >
                  Remove
                </Button>
              </div>
            ))}

            {!enroll ? (
              <Button variant="outline" onClick={() => void begin()} disabled={busy}>
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Add Authenticator
                App
              </Button>
            ) : (
              <div className="space-y-4 rounded-xl border p-4">
                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <div className="rounded-lg bg-white p-3 shadow-inner">
                    {qr ? (
                      <img
                        src={qr}
                        alt="Authenticator setup QR code"
                        className="aspect-square w-full"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Scan this QR code</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Scan locally with your authenticator app. The QR secret is rendered securely
                      in your browser.
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1">
                      Manual Secret Key
                    </p>
                    <code className="block break-all rounded bg-muted p-2 text-xs font-mono">
                      {enroll.secret}
                    </code>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <Label htmlFor="totp-confirm">Enter 6-digit confirmation code</Label>
                  <InputOTP
                    id="totp-confirm"
                    maxLength={6}
                    value={code}
                    onChange={(val) => {
                      setCode(val);
                      setError(null);
                    }}
                    disabled={busy}
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

                <div className="flex justify-end pt-2">
                  <Button onClick={() => void confirm()} disabled={busy || code.length !== 6}>
                    {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Confirm Authenticator
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Identity Verification"
          description="Status of verified communication channels on this account"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Email Address</span>
              <StatusPill value={context?.verification.email ? "verified" : "unverified"} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Phone Number</span>
              <StatusPill value={context?.verification.phone ? "verified" : "unverified"} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Session & Single Sign-On"
          description="Connected identity providers and active sessions"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">MFA Enforcement</span>
              <span className="font-medium text-foreground">
                {context?.session?.mfa_level ?? "Standard"}
              </span>
            </div>
            {tenantKey && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link to={tenantRoutes.sessionSettings(tenantKey)} />}
                >
                  Manage Active Sessions
                </Button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </ErpPage>
  );
}
