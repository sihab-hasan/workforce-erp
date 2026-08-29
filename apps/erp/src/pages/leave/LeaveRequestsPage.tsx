import { History, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { useLeaveListQuery } from "#features/leave/api/leave.queries";
import { LeaveBalanceCard } from "#features/leave/components/LeaveBalanceCard";
import { LeaveTable } from "#features/leave/components/LeaveTable";
import { useLeaveFilters } from "#features/leave/hooks/use-leave-filters";
import { companyRoutes } from "#routes/paths";

export default function LeaveRequestsPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const { page, pageSize, filters, setPage } = useLeaveFilters();
  const query = useLeaveListQuery(filters);

  const leaves = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const lastPage = Math.max(1, query.data?.meta.lastPage ?? 1);

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
      <LeaveBalanceCard />
      <LeaveTable
        leaves={leaves}
        isPending={query.isPending}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        page={page}
        pageSize={pageSize}
        total={total}
        lastPage={lastPage}
        onPageChange={setPage}
      />
    </ErpPage>
  );
}
