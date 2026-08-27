import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, NativeSelect, Textarea } from "#components/erp/FormControls";
import { ErpPage, SectionCard } from "#components/erp/ErpPage";
import { apiGet, apiPost, errorMessage } from "#features/erp-core/api";
import type { LeaveRecord } from "#features/erp-core/types";
import { companyRoutes } from "#routes/paths";
type Options = {
  types: {
    id: string;
    name: string;
    code: string;
    annual_allowance: number;
    used: number;
    remaining: number;
    is_paid: boolean;
  }[];
};
export default function ApplyLeavePage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const options = useQuery({
    queryKey: ["leave-options", tenantKey, companyKey],
    queryFn: () => apiGet<Options>("/api/v1/leave-requests/options"),
  });
  const [form, setForm] = useState({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
  const m = useMutation({
    mutationFn: () => apiPost<LeaveRecord>("/api/v1/leave-requests", form),
    onSuccess: (l) => {
      toast.success("Leave request submitted");
      void qc.invalidateQueries({ queryKey: ["leave", tenantKey, companyKey] });
      nav(companyRoutes.leaveDetails(tenantKey, companyKey, l.id));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const selected = options.data?.types.find((t) => t.id === form.leave_type_id);
  return (
    <ErpPage title="Request leave" description="Submit a leave request for your employee profile.">
      <SectionCard title="Leave request">
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate();
          }}
        >
          <Field label="Leave type">
            <NativeSelect
              required
              value={form.leave_type_id}
              onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
            >
              <option value="">Select leave type</option>
              {options.data?.types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.remaining} days remaining
                </option>
              ))}
            </NativeSelect>
            {selected ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Annual allowance: {selected.annual_allowance} days · Used: {selected.used} ·{" "}
                {selected.is_paid ? "Paid" : "Unpaid"}
              </p>
            ) : null}
          </Field>
          <div />
          <Field label="Start date">
            <Input
              required
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </Field>
          <Field label="End date">
            <Input
              required
              type="date"
              min={form.start_date || undefined}
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Reason">
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Optional context for the approver"
              />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button
              type="submit"
              disabled={m.isPending || !form.leave_type_id || !form.start_date || !form.end_date}
            >
              Submit request
            </Button>
          </div>
        </form>
      </SectionCard>
    </ErpPage>
  );
}
