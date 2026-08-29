import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldPlus } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import {
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
import { apiGet, apiPost, errorMessage } from "#features/erp-core/api";
import { tenantRoutes } from "#routes/paths";

type Data = { roles: RoleRecord[]; permissions: PermissionOption[] };

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const { tenantKey = "" } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiGet<Data>("/api/v1/roles"),
  });

  const save = useMutation({
    mutationFn: (payload: RolePayload) => apiPost<RoleRecord>("/api/v1/roles", payload),
    onSuccess: () => {
      toast.success("Role created successfully");
      void qc.invalidateQueries({ queryKey: ["roles"] });
      navigate(tenantRoutes.roles(tenantKey));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <ErpPage
      title="Create New Role"
      description="Define an organization role name, purpose, and configure granular permissions."
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
      ) : (
        <SectionCard
          title="Role Definition & Capabilities"
          description="Grant authorization permissions across workspace modules for this role."
          actions={
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldPlus className="size-4 text-primary" />
              <span>Custom Role Builder</span>
            </div>
          }
        >
          <RoleForm
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
