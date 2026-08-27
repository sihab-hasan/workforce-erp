import { useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { apiGetPaginated, errorMessage } from "#features/erp-core/api";
import type { DepartmentRecord } from "#features/erp-core/types";
import {
  DataTable,
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

export default function DepartmentListPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const query = useQuery({
    queryKey: ["departments", tenantKey, companyKey],
    queryFn: () => apiGetPaginated<DepartmentRecord>("/api/v1/departments", { per_page: 100 }),
  });
  return (
    <ErpPage
      title="Departments"
      description="Structure teams within the selected company and assign department managers."
      actions={
        <Button
          nativeButton={false}
          render={<Link to={companyRoutes.departmentCreate(tenantKey, companyKey)} />}
        >
          <Plus />
          New department
        </Button>
      }
    >
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : !query.data?.items.length ? (
        <EmptyPanel
          title="No departments"
          description="Create a department to organize employees in this company."
        />
      ) : (
        <DataTable
          columns={["Department", "Code", "Manager", "Employees", "Status", "Actions"]}
          rows={query.data.items.map((d) => [
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">
                {d.branch?.name || "Selected company"}
              </p>
            </div>,
            d.code || "—",
            d.manager?.name || "—",
            d.employees_count,
            <StatusPill value={d.is_active ? "active" : "inactive"} />,
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={<Link to={companyRoutes.departmentDetails(tenantKey, companyKey, d.id)} />}
              >
                <Eye />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={<Link to={companyRoutes.departmentEdit(tenantKey, companyKey, d.id)} />}
              >
                <Pencil />
              </Button>
            </div>,
          ])}
          rowKeys={query.data.items.map((department) => department.id)}
        />
      )}
    </ErpPage>
  );
}
