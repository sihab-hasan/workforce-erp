import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, NativeSelect, Textarea } from "#components/erp/FormControls";
import type { CompanyRecord } from "#features/erp-core/types";

export type CompanyPayload = {
  name: string;
  code: string;
  address: string;
  email: string;
  phone: string;
  timezone: string;
  is_active: boolean;
};

const empty: CompanyPayload = {
  name: "",
  code: "",
  address: "",
  email: "",
  phone: "",
  timezone: "",
  is_active: true,
};

export function CompanyForm({
  initial,
  submitting,
  onSubmit,
  submitLabel = "Save company",
}: {
  initial?: CompanyRecord | null;
  submitting?: boolean;
  onSubmit: (payload: CompanyPayload) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<CompanyPayload>(empty);
  useEffect(() => {
    if (!initial) return;
    setForm({
      name: initial.name ?? "",
      code: initial.code ?? "",
      address: initial.address ?? "",
      email: initial.email ?? "",
      phone: initial.phone ?? "",
      timezone: initial.timezone ?? "",
      is_active: initial.is_active,
    });
  }, [initial]);
  const set = <K extends keyof CompanyPayload>(key: K, value: CompanyPayload[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <Field label="Company name">
        <Input required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Code" hint="Short code used in company-scoped URLs when available.">
        <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="HQ" />
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
      <Field label="Status">
        <NativeSelect
          value={form.is_active ? "active" : "inactive"}
          onChange={(e) => set("is_active", e.target.value === "active")}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </NativeSelect>
      </Field>
      <div className="md:col-span-2">
        <Field label="Address">
          <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={submitting || !form.name.trim()}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
