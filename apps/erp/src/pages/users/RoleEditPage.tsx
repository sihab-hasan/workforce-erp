import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import {
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
} from "#components/erp/ErpPage";
import { RoleForm } from "#features/users/components/RoleForm";
import {
  type PermissionOption,
  type RolePayload,
  type RoleRecord,
} from "#features/users/components/role-form.constants";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
import { tenantRoutes } from "#routes/paths";

type Data = { roles: RoleRecord[]; permissions: PermissionOption[] };

export default function RoleEditPage() {
  const navigate = useNavigate();
  const { tenantKey = "", roleId = "" } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiGet<Data>("/api/v1/roles"),
  });

  const role = q.data?.roles.find((r) => r.id === roleId) ?? null;

  const save = useMutation({
    mutationFn: (payload: RolePayload) => apiPut<RoleRecord>(`/api/v1/roles/${roleId}`, payload),
    onSuccess: () => {
      toast.success("Role updated successfully");
      void qc.invalidateQueries({ queryKey: ["roles"] });
      navigate(tenantRoutes.roles(tenantKey));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <ErpPage
      title={role ? `Edit ${role.name}` : "Edit Role"}
      description="Update role identification and fine-tune granted capabilities."
      actions={
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to={tenantRoutes.roles(tenantKey)} />}
        >
          <ArrowLeft className="size-4" />
          Back to roles
        </Button>
      }
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : !role ? (
        <EmptyPanel
          title="Role not found"
          description="The requested custom role could not be located in this organization."
          action={
            <Button
              nativeButton={false}
              render={<Link to={tenantRoutes.roles(tenantKey)} />}
            >
              Back to roles
            </Button>
          }
        />
      ) : (
        <SectionCard
          title={`Edit ${role.name}`}
          description="Adjust assigned permissions and role metadata."
          actions={
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="size-4 text-primary" />
              <span>{role.permissions.length} Permissions Active</span>
            </div>
          }
        >
          <RoleForm
            initial={role}
            permissions={q.data?.permissions ?? []}
            submitting={save.isPending}
            onCancel={() => navigate(tenantRoutes.roles(tenantKey))}
            onSubmit={(payload) => save.mutate(payload)}
          />
        </SectionCard>
      )}
    </ErpPage>
  );
}
