import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiGetPaginated, apiPatch, errorMessage, formatDateTime } from "#features/erp-core/api";
import type { NotificationRecord } from "#features/erp-core/types";
import { companyPath } from "#routes/paths";
import {
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
} from "#components/erp/ErpPage";

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const { tenantKey, companyKey } = useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGetPaginated<NotificationRecord>("/api/v1/notifications", { per_page: 100 }),
  });
  const mark = useMutation({
    mutationFn: (id: string) => apiPatch(`/api/v1/notifications/${id}/read`, {}),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const all = useMutation({
    mutationFn: () => apiPatch("/api/v1/notifications/read-all", {}),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const handleNotificationClick = (n: NotificationRecord) => {
    if (!n.is_read) {
      mark.mutate(n.id);
    }
    if (n.action_url) {
      if (tenantKey && companyKey) {
        navigate(companyPath(tenantKey, companyKey, n.action_url));
      } else {
        navigate(n.action_url);
      }
    }
  };

  return (
    <ErpPage
      title="Notifications"
      description="System and workflow updates for your active organization."
      actions={
        <Button variant="outline" onClick={() => all.mutate()} disabled={all.isPending}>
          <CheckCheck />
          Mark all read
        </Button>
      }
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : !q.data?.items.length ? (
        <EmptyPanel
          title="No notifications"
          description="Workflow and system notifications will appear here."
        />
      ) : (
        <SectionCard title="Inbox">
          <div className="divide-y divide-border/70">
            {q.data.items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleNotificationClick(n)}
                className={`flex w-full items-start gap-4 px-3 py-4 text-left transition rounded-md hover:bg-muted/40 cursor-pointer ${n.is_read ? "opacity-70" : ""}`}
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${n.is_read ? "bg-muted-foreground/30" : "bg-primary"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                  {n.message ? (
                    <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs capitalize text-muted-foreground">
                      {n.type.replaceAll(".", " · ")}
                    </p>
                    {n.action_url ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                        View details <ExternalLink className="size-3" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      )}
    </ErpPage>
  );
}
