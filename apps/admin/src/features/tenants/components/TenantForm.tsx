import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Button } from "@workforce-erp/ui/components/button";
import { Building2, Mail, Phone, Globe, DollarSign, UserPlus, Loader2, Lock } from "lucide-react";
import { ADMIN_PATHS } from "#routes/paths";
import type {
  TenantStatus,
  TenantDetails,
  CreateTenantPayload,
  UpdateTenantPayload,
} from "../types/tenants.types";

export interface TenantFormProps {
  initialData?: TenantDetails | null;
  onSubmit: (data: CreateTenantPayload | UpdateTenantPayload) => Promise<void>;
  loading?: boolean;
}

export function TenantForm({ initialData, onSubmit, loading }: TenantFormProps) {
  const navigate = useNavigate();
  const isEditing = Boolean(initialData);

  // Organization Fields
  const [name, setName] = useState(initialData?.name || "");
  const [legalName, setLegalName] = useState(initialData?.legal_name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [subdomain, setSubdomain] = useState(initialData?.subdomain || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [country, setCountry] = useState(initialData?.country || "United States");
  const [currency, setCurrency] = useState(initialData?.currency || "USD");
  const [timezone, setTimezone] = useState(initialData?.timezone || "UTC");
  const [plan, setPlan] = useState<string>(initialData?.plan || "pro");
  const [status, setStatus] = useState<TenantStatus>(
    (initialData?.status as TenantStatus) || "active",
  );

  // Initial Owner Account (Only for Creation)
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setError(null);

    try {
      if (isEditing) {
        const payload: UpdateTenantPayload = {
          name: name.trim(),
          legal_name: legalName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          country,
          currency,
          timezone,
          plan,
          status,
        };
        await onSubmit(payload);
      } else {
        const payload: CreateTenantPayload = {
          name: name.trim(),
          legal_name: legalName.trim() || undefined,
          slug: slug.trim() || undefined,
          subdomain: subdomain.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          country,
          currency,
          timezone,
          plan,
          status,
          owner_name: ownerName.trim() || undefined,
          owner_email: ownerEmail.trim() || undefined,
          owner_password: ownerPassword || undefined,
        };
        await onSubmit(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save organization.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      {/* ── Organization Information ────────────────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Organization Information</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Primary enterprise details, branding, and domain configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                placeholder="Acme Global Corporation"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="legal-name">Legal Registered Name</Label>
              <Input
                id="legal-name"
                placeholder="Acme Global Inc."
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-slug">Slug Identifier</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                  /
                </span>
                <Input
                  id="org-slug"
                  placeholder="acme-global"
                  value={slug}
                  disabled={isEditing}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="pl-6 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-subdomain">Workspace Subdomain</Label>
              <div className="relative">
                <Input
                  id="org-subdomain"
                  placeholder="acme"
                  value={subdomain}
                  disabled={isEditing}
                  onChange={(e) =>
                    setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  className="pr-28 font-mono text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                  .workforce.app
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Contact Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="admin@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Regional & Financial Settings ──────────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Regional & Localization</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Country, primary operating currency, and default timezone.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency Code</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Subscription & Lifecycle Plan ───────────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-emerald-500" />
            <CardTitle className="text-base font-bold">Subscription Plan & Status</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Assign subscription tier, feature tier access, and operational status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-select">Subscription Plan</Label>
              <select
                id="plan-select"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="enterprise">
                  Enterprise Plus ($499/mo) — Full Modules & Unlimited
                </option>
                <option value="business">Business Pro ($299/mo) — Advanced HR & Attendance</option>
                <option value="pro">Pro Plan ($199/mo) — Standard Core Workflows</option>
                <option value="starter">Starter Team ($49/mo) — Small Teams</option>
                <option value="trial">Trial Evaluation — 14 Days Free</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status-select">Operational Status</Label>
              <select
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TenantStatus)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="active">Active — Normal Production Access</option>
                <option value="trial">Trial — Evaluation Period</option>
                <option value="suspended">Suspended — Temporarily Blocked</option>
                <option value="inactive">Inactive — Decommissioned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Initial Organization Owner (Creation Only) ─────────────────────── */}
      {!isEditing ? (
        <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-purple-500" />
              <CardTitle className="text-base font-bold">Initial Workspace Owner</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Optionally create the primary owner administrator account for this new organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="owner-name">Owner Full Name</Label>
              <Input
                id="owner-name"
                placeholder="John Doe"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-email">Owner Email</Label>
              <Input
                id="owner-email"
                type="email"
                placeholder="john@acme.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-password">Initial Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="owner-password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Submit & Cancel Actions ────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ADMIN_PATHS.tenants)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <span>{isEditing ? "Save Changes" : "Provision Tenant"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
