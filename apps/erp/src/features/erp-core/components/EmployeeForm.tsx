import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, NativeSelect, Textarea } from "#components/erp/FormControls";
import type { EmployeeRecord } from "#features/erp-core/types";

export interface LookupOption {
  id: string;
  name: string;
  code?: string | null;
  employee_id?: string;
}
export interface EmployeeOptions {
  branches: LookupOption[];
  department_records: (LookupOption & { branch_id?: string | null })[];
  designations: LookupOption[];
  managers: LookupOption[];
}
export interface EmployeePayload {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string | null;
  department_id: string | null;
  designation_id: string | null;
  manager_id: string | null;
  hire_date: string;
  termination_date: string | null;
  status: string;
  employment_type: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}
const empty: EmployeePayload = {
  employee_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  branch_id: null,
  department_id: null,
  designation_id: null,
  manager_id: null,
  hire_date: new Date().toISOString().slice(0, 10),
  termination_date: null,
  status: "active",
  employment_type: "full-time",
  date_of_birth: null,
  gender: null,
  address: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};
export function EmployeeForm({
  initial,
  options,
  submitting,
  onSubmit,
  submitLabel = "Save employee",
}: {
  initial?: EmployeeRecord | null;
  options?: EmployeeOptions;
  submitting?: boolean;
  onSubmit: (payload: EmployeePayload) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<EmployeePayload>(empty);
  useEffect(() => {
    if (initial)
      setForm({
        employee_id: initial.employee_id ?? "",
        first_name: initial.first_name ?? "",
        last_name: initial.last_name ?? "",
        email: initial.email ?? "",
        phone: initial.phone ?? "",
        branch_id: initial.branch_id ?? null,
        department_id: initial.department_id ?? null,
        designation_id: initial.designation_id ?? null,
        manager_id: initial.manager_id ?? null,
        hire_date: initial.hire_date ?? initial.hireDate ?? new Date().toISOString().slice(0, 10),
        termination_date: initial.termination_date ?? null,
        status: initial.status ?? "active",
        employment_type: initial.employment_type ?? initial.employmentType ?? "full-time",
        date_of_birth: initial.date_of_birth ?? null,
        gender: initial.gender ?? null,
        address: initial.address ?? "",
        emergency_contact_name: initial.emergency_contact_name ?? "",
        emergency_contact_phone: initial.emergency_contact_phone ?? "",
        notes: initial.notes ?? "",
      });
  }, [initial]);
  const set = <K extends keyof EmployeePayload>(key: K, value: EmployeePayload[K]) =>
    setForm((c) => ({ ...c, [key]: value }));
  return (
    <form
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Employee ID">
          <Input
            required
            value={form.employee_id}
            onChange={(e) => set("employee_id", e.target.value)}
          />
        </Field>
        <Field label="First name">
          <Input
            required
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
          />
        </Field>
        <Field label="Last name">
          <Input
            required
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Hire date">
          <Input
            required
            type="date"
            value={form.hire_date}
            onChange={(e) => set("hire_date", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Department">
          <NativeSelect
            value={form.department_id ?? ""}
            onChange={(e) => set("department_id", e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {options?.department_records.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Designation">
          <NativeSelect
            value={form.designation_id ?? ""}
            onChange={(e) => set("designation_id", e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {options?.designations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Manager">
          <NativeSelect
            value={form.manager_id ?? ""}
            onChange={(e) => set("manager_id", e.target.value || null)}
          >
            <option value="">No manager</option>
            {options?.managers
              .filter((o) => o.id !== initial?.id)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.employee_id ? ` · ${o.employee_id}` : ""}
                </option>
              ))}
          </NativeSelect>
        </Field>
        <Field label="Employment type">
          <NativeSelect
            value={form.employment_type}
            onChange={(e) => set("employment_type", e.target.value)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
            <option value="temporary">Temporary</option>
          </NativeSelect>
        </Field>
        <Field label="Status">
          <NativeSelect value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="on-leave">On leave</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </NativeSelect>
        </Field>
        <Field label="Termination date">
          <Input
            type="date"
            value={form.termination_date ?? ""}
            onChange={(e) => set("termination_date", e.target.value || null)}
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Date of birth">
          <Input
            type="date"
            value={form.date_of_birth ?? ""}
            onChange={(e) => set("date_of_birth", e.target.value || null)}
          />
        </Field>
        <Field label="Gender">
          <Input
            value={form.gender ?? ""}
            onChange={(e) => set("gender", e.target.value || null)}
          />
        </Field>
        <Field label="Emergency contact">
          <Input
            value={form.emergency_contact_name}
            onChange={(e) => set("emergency_contact_name", e.target.value)}
          />
        </Field>
        <Field label="Emergency phone">
          <Input
            value={form.emergency_contact_phone}
            onChange={(e) => set("emergency_contact_phone", e.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Address">
            <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-3">
          <Field label="Internal notes">
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting || !form.employee_id.trim() || !form.email.trim()}
        >
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
