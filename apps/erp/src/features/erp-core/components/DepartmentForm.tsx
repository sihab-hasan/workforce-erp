import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, NativeSelect } from "#components/erp/FormControls";
import type { DepartmentRecord } from "#features/erp-core/types";

export interface DepartmentPayload {
  name: string;
  code: string;
  manager_id: string | null;
  is_active: boolean;
}
export interface EmployeeOption {
  id: string;
  name: string;
  employee_id: string;
}

export function DepartmentForm({
  initial,
  managers = [],
  submitting,
  onSubmit,
  submitLabel = "Save department",
}: {
  initial?: DepartmentRecord | null;
  managers?: EmployeeOption[];
  submitting?: boolean;
  onSubmit: (payload: DepartmentPayload) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<DepartmentPayload>({
    name: "",
    code: "",
    manager_id: null,
    is_active: true,
  });
  useEffect(() => {
    if (initial)
      setForm({
        name: initial.name,
        code: initial.code ?? "",
        manager_id: initial.manager?.id ?? null,
        is_active: initial.is_active,
      });
  }, [initial]);
  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Field label="Department name">
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Code">
        <Input
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="FIN"
        />
      </Field>
      <Field label="Manager">
        <NativeSelect
          value={form.manager_id ?? ""}
          onChange={(e) => setForm({ ...form, manager_id: e.target.value || null })}
        >
          <option value="">No manager assigned</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} · {m.employee_id}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Status">
        <NativeSelect
          value={form.is_active ? "active" : "inactive"}
          onChange={(e) => setForm({ ...form, is_active: e.target.value === "active" })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </NativeSelect>
      </Field>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={submitting || !form.name.trim()}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
