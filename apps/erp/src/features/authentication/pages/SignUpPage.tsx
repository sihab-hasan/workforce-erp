import { useState } from "react";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { Checkbox } from "@workforce-erp/ui/components/checkbox";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { authenticationApi } from "#features/authentication/api/authentication.api";
import { AUTH_PATHS } from "#features/authentication/navigation";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    country: "BD",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const email = form.email.trim().toLowerCase();
    if (
      !form.name.trim() ||
      !email ||
      !form.organization.trim() ||
      !/^[A-Z]{2}$/i.test(form.country)
    ) {
      setError("Complete all required organization registration fields.");
      return;
    }
    if (form.phone && !/^\+[1-9]\d{7,14}$/.test(form.phone.trim())) {
      setError("Phone must use international E.164 format, for example +8801XXXXXXXXX.");
      return;
    }
    if (form.password.length < 12) {
      setError("Use a password or passphrase of at least 12 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Password confirmation does not match.");
      return;
    }
    if (!form.terms) {
      setError("You must accept the terms to create an organization.");
      return;
    }

    setLoading(true);
    try {
      const response = await authenticationApi.register({
        name: form.name.trim(),
        email,
        organization_name: form.organization.trim(),
        country: form.country.trim().toUpperCase(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        password: form.password,
        password_confirmation: form.confirm,
        terms: true,
      });
      navigate(`${AUTH_PATHS.verifyEmail}?challenge=${encodeURIComponent(response.challenge.id)}`, {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Organization registration could not be started.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      icon={<Building2 className="size-6" />}
      heading="Create your organization"
      subheading="Create a new Workforce ERP tenant. Existing organization users must join by invitation."
      footer={
        <>
          Already have access?{" "}
          <Link
            to={AUTH_PATHS.login}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="signup-email">Work email</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="signup-organization">Organization / company name</Label>
            <Input
              id="signup-organization"
              autoComplete="organization"
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-country">Country code</Label>
            <Input
              id="signup-country"
              maxLength={2}
              value={form.country}
              onChange={(e) =>
                update("country", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-phone">Phone (optional)</Label>
            <Input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+8801XXXXXXXXX"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                disabled={loading}
                className="pr-9"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use 12+ characters. Password managers and paste are supported.
            </p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="signup-confirm">Confirm password</Label>
            <Input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer select-none">
          <Checkbox
            className="mt-0.5"
            checked={form.terms}
            onCheckedChange={(checked) => update("terms", Boolean(checked))}
            disabled={loading}
          />
          <span>
            I accept the applicable terms and confirm I am authorized to create this organization
            workspace.
          </span>
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Creating secure registration…
            </>
          ) : (
            "Create organization"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
