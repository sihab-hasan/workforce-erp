import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
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
export default function LeaveHistoryPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const q = useQuery({
    queryKey: ["leave-history", tenantKey, companyKey],
    queryFn: () =>
      apiGetPaginated<LeaveRecord>("/api/v1/leave-requests", { per_page: 100, mine: true }),
  });
  return (
    <ErpPage
      title="My leave history"
      description="Your leave requests in this organization/company."
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : !q.data?.items.length ? (
        <EmptyPanel title="No leave history" />
      ) : (
        <DataTable
          columns={["Type", "Dates", "Days", "Status", "Reviewed by", "Action"]}
          rows={q.data.items.map((l) => [
            l.leave_type?.name || "—",
            `${formatDate(l.start_date)} → ${formatDate(l.end_date)}`,
            l.total_days,
            <StatusPill value={l.status} />,
            l.reviewer?.name || "—",
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
