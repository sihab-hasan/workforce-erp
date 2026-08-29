import { Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { useLeaveListQuery } from "#features/leave/api/leave.queries";
import { LeaveTable } from "#features/leave/components/LeaveTable";
import { useLeaveFilters } from "#features/leave/hooks/use-leave-filters";
import { companyRoutes } from "#routes/paths";

export default function LeaveHistoryPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const { page, pageSize, filters, setPage } = useLeaveFilters({ mine: true });
  const query = useLeaveListQuery(filters);

  const leaves = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const lastPage = Math.max(1, query.data?.meta.lastPage ?? 1);

  return (
    <ErpPage
      title="My leave history"
      description="Your leave requests in this organization/company."
      actions={
        <Button
          nativeButton={false}
          render={<Link to={companyRoutes.leaveCreate(tenantKey, companyKey)} />}
        >
          <Plus />
          Request leave
        </Button>
      }
    >
      <LeaveTable
        leaves={leaves}
        isPending={query.isPending}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        showEmployee={false}
        title="My leave requests"
        description="Leave requests submitted from your employee profile."
        page={page}
        pageSize={pageSize}
        total={total}
        lastPage={lastPage}
        onPageChange={setPage}
      />
    </ErpPage>
  );
}
