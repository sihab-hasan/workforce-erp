import { useQuery } from "@tanstack/react-query";
import { Eye, History, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { apiGetPaginated, errorMessage, formatDate } from "#features/erp-core/api";
import type { LeaveRecord } from "#features/erp-core/types";
import {
  DataTable,
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
export default function LeaveRequestListPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const q = useQuery({
    queryKey: ["leave", tenantKey, companyKey],
    queryFn: () => apiGetPaginated<LeaveRecord>("/api/v1/leave-requests", { per_page: 100 }),
  });
  return (
    <ErpPage
      title="Leave requests"
      description="Submit, review and track employee leave inside the selected company."
      actions={
        <>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.leaveHistory(tenantKey, companyKey)} />}
          >
            <History />
            History
          </Button>
          <Button
            nativeButton={false}
            render={<Link to={companyRoutes.leaveCreate(tenantKey, companyKey)} />}
          >
            <Plus />
            Request leave
          </Button>
        </>
      }
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : !q.data?.items.length ? (
        <EmptyPanel
          title="No leave requests"
          description="No leave requests have been submitted in this company."
        />
      ) : (
        <DataTable
          columns={["Employee", "Leave type", "Dates", "Days", "Status", "Action"]}
          rows={q.data.items.map((l) => [
            <div>
              <p className="font-medium">{l.employee?.name || "—"}</p>
              <p className="text-xs text-muted-foreground">
                {l.employee?.department || l.employee?.employee_id}
              </p>
            </div>,
            l.leave_type?.name || "—",
            <span>
              {formatDate(l.start_date)} → {formatDate(l.end_date)}
            </span>,
            l.total_days,
            <StatusPill value={l.status} />,
            <Button
              size="icon-sm"
              variant="ghost"
              nativeButton={false}
              render={<Link to={companyRoutes.leaveDetails(tenantKey, companyKey, l.id)} />}
            >
              <Eye />
            </Button>,
          ])}
          rowKeys={q.data.items.map((leave) => leave.id)}
        />
      )}
    </ErpPage>
  );
}
