import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiGet, apiPatch, errorMessage, formatDateTime } from "#features/erp-core/api";
import type { ApprovalRecord } from "#features/erp-core/types";
import {
  DataTable,
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
export function ApprovalsPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["approvals", tenantKey, companyKey],
    queryFn: () => apiGet<ApprovalRecord[]>("/api/v1/approvals"),
  });
  const action = useMutation({
    mutationFn: ({ id, verb }: { id: string; verb: "approve" | "reject" }) =>
      apiPatch(`/api/v1/approvals/${id}/${verb}`, {}),
    onSuccess: () => {
      toast.success("Approval updated");
      void qc.invalidateQueries({ queryKey: ["approvals", tenantKey, companyKey] });
      void qc.invalidateQueries({ queryKey: ["leave"] });
      void qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <ErpPage
      title="Approvals"
      description="Review pending leave and timesheet submissions in one queue."
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : !q.data?.length ? (
        <EmptyPanel
          title="You're all caught up"
          description="There are no pending approvals in this company."
        />
      ) : (
        <DataTable
          columns={["Request", "Type", "Submitted", "Status", "Actions"]}
          rows={q.data.map((a) => [
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.subtitle}</p>
            </div>,
            <span className="capitalize">{a.type}</span>,
            formatDateTime(a.submitted_at),
            <StatusPill value={a.status} />,
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={<Link to={companyRoutes.approvalDetails(tenantKey, companyKey, a.id)} />}
              >
                <Eye />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => action.mutate({ id: a.id, verb: "approve" })}
              >
                <Check />
              </Button>
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={() => action.mutate({ id: a.id, verb: "reject" })}
              >
                <X />
              </Button>
            </div>,
          ])}
          rowKeys={q.data.map((approval) => approval.id)}
        />
      )}
    </ErpPage>
  );
}
export default ApprovalsPage;
