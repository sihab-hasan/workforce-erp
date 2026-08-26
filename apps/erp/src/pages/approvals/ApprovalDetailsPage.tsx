import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiGet, apiPatch, errorMessage } from "#features/erp-core/api";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatusPill,
} from "#components/erp/ErpPage";
type Detail = {
  id: string;
  type: string;
  entity_id: string;
  status: string;
  data: Record<string, string | number | null>;
};
export function ApprovalDetailsPage() {
  const { tenantKey = "", companyKey = "", approvalId = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["approval", tenantKey, companyKey, approvalId],
    queryFn: () => apiGet<Detail>(`/api/v1/approvals/${approvalId}`),
  });
  const act = useMutation({
    mutationFn: (verb: "approve" | "reject") =>
      apiPatch(`/api/v1/approvals/${approvalId}/${verb}`, {}),
    onSuccess: () => {
      toast.success("Approval updated");
      void qc.invalidateQueries({ queryKey: ["approvals"] });
      void q.refetch();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  return (
    <ErpPage
      title={`${q.data.type.charAt(0).toUpperCase() + q.data.type.slice(1)} approval`}
      description={`Approval ${q.data.id}`}
      actions={
        q.data.status === "pending" ? (
          <>
            <Button onClick={() => act.mutate("approve")}>
              <Check />
              Approve
            </Button>
            <Button variant="destructive" onClick={() => act.mutate("reject")}>
              <X />
              Reject
            </Button>
          </>
        ) : (
          <StatusPill value={q.data.status} />
        )
      }
    >
      <SectionCard title="Request details">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(q.data.data).map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {key.replaceAll("_", " ")}
              </dt>
              <dd className="mt-1 text-sm">
                {value == null || value === "" ? "—" : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </ErpPage>
  );
}
export default ApprovalDetailsPage;
