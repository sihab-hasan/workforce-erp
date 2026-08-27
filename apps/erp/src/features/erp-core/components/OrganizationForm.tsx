import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, Textarea } from "#components/erp/FormControls";
import type { OrganizationRecord } from "#features/erp-core/types";
export interface OrganizationPayload {
  name: string;
  legal_name: string;
  slug: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  locale: string;
}
export function OrganizationForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: OrganizationRecord | null;
  submitting?: boolean;
  onSubmit: (p: OrganizationPayload) => void;
}) {
  const [form, setForm] = useState<OrganizationPayload>({
    name: "",
    legal_name: "",
    slug: "",
    subdomain: "",
    email: "",
    phone: "",
    address: "",
    timezone: "UTC",
    locale: "en",
  });
  useEffect(() => {
    if (initial)
      setForm({
        name: initial.name ?? "",
        legal_name: initial.legal_name ?? "",
        slug: initial.slug ?? "",
        subdomain: initial.subdomain ?? "",
        email: initial.email ?? "",
        phone: initial.phone ?? "",
        address: initial.address ?? "",
        timezone: initial.timezone ?? "UTC",
        locale: initial.locale ?? "en",
      });
  }, [initial]);
  const set = <K extends keyof OrganizationPayload>(k: K, v: OrganizationPayload[K]) =>
    setForm((c) => ({ ...c, [k]: v }));
  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Field label="Organization name">
        <Input required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Legal name">
        <Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} />
      </Field>
      <Field label="Slug">
        <Input
          required
          value={form.slug}
          onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
        />
      </Field>
      <Field label="Subdomain">
        <Input value={form.subdomain} onChange={(e) => set("subdomain", e.target.value)} />
      </Field>
      <Field label="Email">
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Timezone">
        <Input
          value={form.timezone}
          onChange={(e) => set("timezone", e.target.value)}
          placeholder="Asia/Dhaka"
        />
      </Field>
      <Field label="Locale">
        <Input
          value={form.locale}
          onChange={(e) => set("locale", e.target.value)}
          placeholder="en"
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Address">
          <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={submitting || !form.name.trim() || !form.slug.trim()}>
          {submitting ? <Loader2 className="animate-spin" /> : null}Save organization
        </Button>
      </div>
    </form>
  );
}
