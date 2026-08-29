import { Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { CapabilityGate } from "@workforce-erp/authorization";
import { Button } from "@workforce-erp/ui/components/button";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { errorMessage, formatDate, formatDateTime } from "#features/erp-core/api";
import {
  useApproveLeaveMutation,
  useCancelLeaveMutation,
  useRejectLeaveMutation,
} from "#features/leave/api/leave.mutations";
import { useLeaveDetailsQuery } from "#features/leave/api/leave.queries";
import { useCurrentEmployeeId } from "#features/leave/hooks/use-leave";

export default function LeaveRequestDetailsPage() {
  const { leaveRequestId = "" } = useParams();
  const query = useLeaveDetailsQuery(leaveRequestId);
  const currentEmployeeId = useCurrentEmployeeId();
  const cancelLeave = useCancelLeaveMutation(leaveRequestId);
  const approveLeave = useApproveLeaveMutation(leaveRequestId);
  const rejectLeave = useRejectLeaveMutation(leaveRequestId);

  if (query.isPending) return <LoadingState />;
  if (query.isError || !query.data)
    return <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />;

  const leave = query.data.data;
  const isOwnRequest = currentEmployeeId !== null && leave.employee?.id === currentEmployeeId;
  const canCancel = leave.status === "pending" && isOwnRequest;
  const canReview = leave.status === "pending" && !isOwnRequest;
  const days = Number(leave.total_days);
  const daysLabel = Number.isInteger(days) ? String(days) : days.toFixed(1);

  function cancelRequest() {
    cancelLeave.mutate(undefined, {
      onSuccess: () => toast.success("Leave request cancelled"),
      onError: (error) =>
        toast.error("Unable to cancel leave request", { description: errorMessage(error) }),
    });
  }

  function approveRequest() {
    approveLeave.mutate(undefined, {
      onSuccess: () => toast.success("Leave request approved"),
      onError: (error) =>
        toast.error("Unable to approve leave request", { description: errorMessage(error) }),
    });
  }

  function rejectRequest() {
    rejectLeave.mutate(undefined, {
      onSuccess: () => toast.success("Leave request rejected"),
      onError: (error) =>
        toast.error("Unable to reject leave request", { description: errorMessage(error) }),
    });
  }

  return (
    <ErpPage
      title="Leave request"
      description={`${leave.employee?.name || "Employee"} · ${leave.leave_type?.name || "Leave"}`}
      actions={
        leave.status === "pending" ? (
          <>
            {canReview && (
              <CapabilityGate capability="leave.approve">
                <Button
                  variant="outline"
                  disabled={approveLeave.isPending || rejectLeave.isPending}
                  onClick={approveRequest}
                >
                  <Check />
                  Approve
                </Button>
              </CapabilityGate>
            )}
            {canReview && (
              <CapabilityGate capability="leave.approve">
                <Button
                  variant="destructive"
                  disabled={approveLeave.isPending || rejectLeave.isPending}
                  onClick={rejectRequest}
                >
                  <X />
                  Reject
                </Button>
              </CapabilityGate>
            )}
            {canCancel && (
              <CapabilityGate capability="leave.request">
                <Button variant="ghost" disabled={cancelLeave.isPending} onClick={cancelRequest}>
                  Cancel request
                </Button>
              </CapabilityGate>
            )}
          </>
        ) : undefined
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Status" value={<StatusPill value={leave.status} />} />
        <StatCard label="Duration" value={`${daysLabel} day${days === 1 ? "" : "s"}`} />
        <StatCard
          label="Submitted"
          value={<span className="text-base">{formatDate(leave.created_at)}</span>}
        />
      </div>
      <SectionCard title="Request details">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Employee" value={leave.employee?.name} />
          <Info label="Employee ID" value={leave.employee?.employee_id} />
          <Info label="Department" value={leave.employee?.department} />
          <Info label="Leave type" value={leave.leave_type?.name} />
          <Info label="Start date" value={formatDate(leave.start_date)} />
          <Info label="End date" value={formatDate(leave.end_date)} />
        </dl>
        {leave.reason ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{leave.reason}</p>
          </div>
        ) : null}
      </SectionCard>
      {leave.reviewed_at || leave.review_note ? (
        <SectionCard title="Review">
          <InfoGrid
            items={[
              ["Reviewed by", leave.reviewer?.name],
              ["Reviewed at", formatDateTime(leave.reviewed_at)],
              ["Note", leave.review_note],
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
      {items.map(([label, value]) => (
        <Info key={label} label={label} value={value} />
      ))}
    </dl>
  );
}
