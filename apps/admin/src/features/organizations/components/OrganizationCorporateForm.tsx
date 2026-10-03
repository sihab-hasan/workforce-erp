import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
import { Building2, Globe, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";
import { adminOrganizationDetailsPath } from "#routes/paths";
import type {
  OrganizationDetails,
  UpdateOrganizationCorporatePayload,
} from "../types/organizations.types";

export interface OrganizationCorporateFormProps {
  initialData: OrganizationDetails;
  onSubmit: (data: UpdateOrganizationCorporatePayload) => Promise<void>;
  loading?: boolean;
}

export function OrganizationCorporateForm({
  initialData,
  onSubmit,
  loading = false,
}: OrganizationCorporateFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [legalName, setLegalName] = useState(initialData.legal_name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [country, setCountry] = useState(initialData.country || "United States");
  const [currency, setCurrency] = useState(initialData.currency || "USD");
  const [timezone, setTimezone] = useState(initialData.timezone || "UTC");
  const [fiscalYearStart, setFiscalYearStart] = useState<number>(
    initialData.fiscal_year_start_month || 1,
  );

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setError(null);

    try {
      const payload: UpdateOrganizationCorporatePayload = {
        name: name.trim(),
        legal_name: legalName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        country: country.trim() || undefined,
        currency: currency.trim() || undefined,
        timezone: timezone.trim() || undefined,
        fiscal_year_start_month: Number(fiscalYearStart) || 1,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save corporate details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      {/* ── Corporate Identity ────────────────────────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Corporate Identity & Registration</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Official trade names, registered business entity records, and head office contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="corp-name">Operating Business Name *</Label>
              <Input
                id="corp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Global Corporation"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="legal-name">Legal Registered Entity Name</Label>
              <Input
                id="legal-name"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Acme Global Technologies Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Corporate Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hq@acme.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Corporate Telephone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hq-address">Headquarters Physical Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <textarea
                id="hq-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="100 Enterprise Way, Suite 400, San Francisco, CA"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Financial & Regional Settings ────────────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Localization & Fiscal Period</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Country of incorporation, reporting currency, and financial year schedules.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Label htmlFor="currency">Base Currency</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={4}
              className="font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Default Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fiscal-month">Fiscal Year Start Month</Label>
            <select
              id="fiscal-month"
              value={fiscalYearStart}
              onChange={(e) => setFiscalYearStart(Number(e.target.value))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value={1}>January (Calendar Year)</option>
              <option value={4}>April (Q2 Start)</option>
              <option value={7}>July (Mid Year)</option>
              <option value={10}>October (Q4 Start)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── Form Actions ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          render={<Link to={adminOrganizationDetailsPath(initialData.id)} />}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading} className="gap-1.5 font-semibold">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>Save Corporate Details</span>
        </Button>
      </div>
    </form>
  );
}
