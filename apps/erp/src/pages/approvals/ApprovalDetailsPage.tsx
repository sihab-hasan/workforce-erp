import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { Badge } from "@workforce-erp/ui/components/badge";
import { toast } from "sonner";
import { apiGet, apiPatch, errorMessage } from "#features/erp-core/api";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

type Detail = {
  id: string;
  type: string;
  entity_id: string;
  status: string;
  data: Record<string, string | number | null>;
};

export function ApprovalDetailsPage() {
  const { tenantKey = "", companyKey = "", approvalId = "" } = useParams();
  const [comment, setComment] = useState("");
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["approval", tenantKey, companyKey, approvalId],
    queryFn: () => apiGet<Detail>(`/api/v1/approvals/${approvalId}`),
  });

  const act = useMutation({
    mutationFn: (verb: "approve" | "reject") =>
      apiPatch(`/api/v1/approvals/${approvalId}/${verb}`, { remarks: comment }),
    onSuccess: () => {
      toast.success("Approval decision submitted");
      void qc.invalidateQueries({ queryKey: ["approvals"] });
      void q.refetch();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const backUrl = companyRoutes.approvals(tenantKey, companyKey);

  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;

  const isPending = q.data.status === "pending";

  const timelineSteps = [
    {
      id: "submission",
      title: "Request Submitted",
      description: `Applicant submitted ${q.data.type} request #${q.data.entity_id}`,
      status: "Submitted",
      tone: "success" as const,
      timestamp: "Initial step",
    },
    {
      id: "review",
      title: "Manager / Approver Review",
      description: isPending
        ? "Waiting for operational decision"
        : `Status marked as ${q.data.status}`,
      status: isPending
        ? "Pending Decision"
        : q.data.status === "approved"
          ? "Approved"
          : "Rejected",
      tone: isPending
        ? ("warning" as const)
        : q.data.status === "approved"
          ? ("success" as const)
          : ("danger" as const),
      current: isPending,
    },
  ];

  return (
    <ErpPage
      title={`${q.data.type.charAt(0).toUpperCase() + q.data.type.slice(1)} approval`}
      description={`Review and act upon submission #${q.data.id}`}
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to approvals
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current status" value={<StatusPill value={q.data.status} />} />
        <StatCard
          label="Request category"
          value={<span className="text-base font-semibold capitalize">{q.data.type}</span>}
        />
        <StatCard
          label="Reference ID"
          value={<span className="text-base font-mono">#{q.data.entity_id}</span>}
        />
        <StatCard
          label="Queue ID"
          value={<span className="text-base font-mono">#{q.data.id}</span>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Submission details"
            description="Parameters and values from the requester"
          >
            <dl className="grid gap-5 sm:grid-cols-2">
              {Object.entries(q.data.data).map(([key, value]) => (
                <div key={key} className="rounded-lg border p-3">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {key.replaceAll("_", " ")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {value == null || value === "" ? "—" : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          {isPending && (
            <SectionCard
              title="Approval decision"
              description="Authorize or decline this request with optional comments"
            >
              <div className="space-y-3 rounded-2xl border bg-card p-4">
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add a note for the requester…"
                  className="min-h-20"
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => act.mutate("reject")}
                    disabled={act.isPending}
                  >
                    Reject Request
                  </Button>
                  <Button
                    onClick={() => act.mutate("approve")}
                    disabled={act.isPending}
                  >
                    {act.isPending ? "Working…" : "Approve Request"}
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div>
          <SectionCard title="Workflow timeline" description="Progression and audit trail">
            <ol className="space-y-0">
              {timelineSteps.map((step, index) => (
                <li
                  key={step.id}
                  className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0"
                >
                  {index < timelineSteps.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[0.72rem] top-5 bottom-0 w-px bg-border"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={`relative z-10 mt-1 size-3 rounded-full border-2 border-background ring-1 ring-border ${
                      step.current
                        ? "bg-primary ring-primary/50"
                        : step.tone === "success"
                          ? "bg-emerald-500"
                          : step.tone === "danger"
                            ? "bg-destructive"
                            : step.tone === "warning"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/50"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium ${step.current ? "font-semibold" : ""}`}
                        >
                          {step.title}
                        </span>
                        {step.status ? (
                          <Badge variant="outline" className="h-6 rounded-full px-2.5">
                            {step.status}
                          </Badge>
                        ) : null}
                      </div>
                      {step.timestamp ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {step.timestamp}
                        </span>
                      ) : null}
                    </div>
                    {step.description ? (
                      <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
      </div>
    </ErpPage>
  );
}
export default ApprovalDetailsPage;
