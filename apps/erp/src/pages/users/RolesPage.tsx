import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Badge } from "@workforce-erp/ui/components/badge";
import { toast } from "sonner";
import { DataTable, EmptyPanel, ErpPage, ErrorState, LoadingState } from "#components/erp/ErpPage";
import {
  getPermissionPresentation,
  type PermissionOption,
  type RoleRecord,
} from "#features/users/components/role-form.constants";
import { apiDelete, apiGet, errorMessage } from "#features/erp-core/api";
import { tenantRoutes } from "#routes/paths";

type Data = { roles: RoleRecord[]; permissions: PermissionOption[] };

export default function RoleListPage() {
  const { tenantKey = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["roles"], queryFn: () => apiGet<Data>("/api/v1/roles") });

  const rm = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/roles/${id}`),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      void qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <ErpPage
      title="Roles & permissions"
      description="Create organization-specific roles and configure intuitive permission sets."
      actions={
        <Button nativeButton={false} render={<Link to={tenantRoutes.roleCreate(tenantKey)} />}>
          <Plus className="size-4" />
          New role
        </Button>
      }
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {!q.data?.roles.length ? (
            <EmptyPanel
              title="No custom roles"
              description="Create a role to define explicit permission sets for employees."
              action={
                <Button
                  nativeButton={false}
                  render={<Link to={tenantRoutes.roleCreate(tenantKey)} />}
                >
                  <Plus className="size-4" />
                  Create First Role
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={["Role", "Employees", "Permissions Granted", "Actions"]}
              rows={q.data.roles.map((r) => [
                <div>
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.description || "No description provided"}
                  </p>
                </div>,
                <Badge variant="secondary" className="font-medium">
                  {r.employees_count ?? 0} {(r.employees_count ?? 0) === 1 ? "member" : "members"}
                </Badge>,
                <div className="flex flex-wrap items-center gap-1.5 py-1">
                  {r.permissions.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      No explicit permissions
                    </span>
                  ) : r.permissions.length >= (q.data?.permissions.length ?? 0) ? (
                    <Badge variant="default" className="bg-primary/90 text-xs">
                      Full Administrator Access ({r.permissions.length})
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="font-medium">
                        {r.permissions.length} {r.permissions.length === 1 ? "grant" : "grants"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {r.permissions
                          .slice(0, 3)
                          .map((p) => getPermissionPresentation(p).label)
                          .join(", ")}
                        {r.permissions.length > 3 ? ` +${r.permissions.length - 3} more` : ""}
                      </span>
                    </>
                  )}
                </div>,
                <div className="flex gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    nativeButton={false}
                    render={<Link to={tenantRoutes.roleEdit(tenantKey, r.id)} />}
                  >
                    <Pencil className="size-4" />
                    <span className="sr-only">Edit Role</span>
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the role "${r.name}"?`)) {
                        rm.mutate(r.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete Role</span>
                  </Button>
                </div>,
              ])}
              rowKeys={q.data.roles.map((role) => role.id)}
            />
          )}
        </>
      )}
    </ErpPage>
  );
}
