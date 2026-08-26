import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiGet, apiPatch, errorMessage, formatDate, formatDateTime } from "#features/erp-core/api";
import type { LeaveRecord } from "#features/erp-core/types";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
export default function LeaveRequestDetailsPage() {
  const { tenantKey = "", companyKey = "", leaveRequestId = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["leave-detail", tenantKey, companyKey, leaveRequestId],
    queryFn: () => apiGet<LeaveRecord>(`/api/v1/leave-requests/${leaveRequestId}`),
  });
  const act = useMutation({
    mutationFn: (action: "approve" | "reject" | "cancel") =>
      apiPatch<LeaveRecord>(`/api/v1/leave-requests/${leaveRequestId}/${action}`, {}),
    onSuccess: (d) => {
      toast.success(`Leave request ${d.status}`);
      void qc.invalidateQueries({ queryKey: ["leave"] });
      void q.refetch();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const l = q.data;
  return (
    <ErpPage
      title="Leave request"
      description={`${l.employee?.name || "Employee"} · ${l.leave_type?.name || "Leave"}`}
      actions={
        l.status === "pending" ? (
          <>
            <Button variant="outline" onClick={() => act.mutate("approve")}>
              <Check />
              Approve
            </Button>
            <Button variant="destructive" onClick={() => act.mutate("reject")}>
              <X />
              Reject
            </Button>
            <Button variant="ghost" onClick={() => act.mutate("cancel")}>
              Cancel request
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Status" value={<StatusPill value={l.status} />} />
        <StatCard label="Duration" value={`${l.total_days} day${l.total_days === 1 ? "" : "s"}`} />
        <StatCard
          label="Submitted"
          value={<span className="text-base">{formatDate(l.created_at)}</span>}
        />
      </div>
      <SectionCard title="Request details">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Employee" value={l.employee?.name} />
          <Info label="Employee ID" value={l.employee?.employee_id} />
          <Info label="Department" value={l.employee?.department} />
          <Info label="Leave type" value={l.leave_type?.name} />
          <Info label="Start date" value={formatDate(l.start_date)} />
          <Info label="End date" value={formatDate(l.end_date)} />
        </dl>
        {l.reason ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{l.reason}</p>
          </div>
        ) : null}
      </SectionCard>
      {l.reviewed_at || l.review_note ? (
        <SectionCard title="Review">
          <InfoGrid
            items={[
              ["Reviewed by", l.reviewer?.name],
              ["Reviewed at", formatDateTime(l.reviewed_at)],
              ["Note", l.review_note],
            ]}
          />
        </SectionCard>
      ) : null}
    </ErpPage>
  );
}
function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}
function InfoGrid({ items }: { items: [string, string | undefined | null][] }) {
  return (
    <dl className="grid gap-5 sm:grid-cols-3">
      {items.map(([l, v]) => (
        <Info key={l} label={l} value={v} />
      ))}
    </dl>
  );
}
