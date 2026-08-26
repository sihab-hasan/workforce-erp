import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { Field, Input, Textarea } from "#components/erp/FormControls";
import {
  DataTable,
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
} from "#components/erp/ErpPage";
import { apiDelete, apiGet, apiPost, apiPut, errorMessage } from "#features/erp-core/api";
type Role = {
  id: string;
  name: string;
  description?: string | null;
  employees_count: number;
  permissions: string[];
};
type Permission = { id: string; name: string; description?: string | null };
type Payload = { name: string; description: string; permissions: string[] };
type Data = { roles: Role[]; permissions: Permission[] };
export default function RoleListPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["roles"], queryFn: () => apiGet<Data>("/api/v1/roles") });
  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);
  const save = useMutation({
    mutationFn: (p: Payload) =>
      editing ? apiPut<Role>(`/api/v1/roles/${editing.id}`, p) : apiPost<Role>("/api/v1/roles", p),
    onSuccess: () => {
      toast.success(editing ? "Role updated" : "Role created");
      setEditing(null);
      setCreating(false);
      void qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rm = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/roles/${id}`),
    onSuccess: () => {
      toast.success("Role deleted");
      void qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <ErpPage
      title="Roles & permissions"
      description="Create organization-specific roles and permission sets."
      actions={
        <Button onClick={() => setCreating(true)}>
          <Plus />
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
            />
          ) : (
            <DataTable
              columns={["Role", "Employees", "Permissions", "Actions"]}
              rows={q.data.roles.map((r) => [
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.description || "No description"}
                  </p>
                </div>,
                r.employees_count,
                <span className="text-xs text-muted-foreground">
                  {r.permissions.length ? r.permissions.join(", ") : "No explicit permissions"}
                </span>,
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => setEditing(r)}>
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete this role?")) rm.mutate(r.id);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>,
              ])}
              rowKeys={q.data.roles.map((role) => role.id)}
            />
          )}{" "}
          {(creating || editing) && (
            <SectionCard title={editing ? `Edit ${editing.name}` : "Create role"}>
              <RoleForm
                initial={editing}
                permissions={q.data?.permissions ?? []}
                submitting={save.isPending}
                onCancel={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                onSubmit={(p) => save.mutate(p)}
              />
            </SectionCard>
          )}
        </>
      )}
    </ErpPage>
  );
}
function RoleForm({
  initial,
  permissions,
  submitting,
  onCancel,
  onSubmit,
}: {
  initial: Role | null;
  permissions: Permission[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (p: Payload) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selected, setSelected] = useState<string[]>(initial?.permissions ?? []);
  const toggle = (p: string) =>
    setSelected((c) => (c.includes(p) ? c.filter((v) => v !== p) : [...c, p]));
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description, permissions: selected });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Role name">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium">Permissions</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {permissions.map((p) => (
            <label key={p.id} className="flex items-start gap-2 rounded-2xl border p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={selected.includes(p.name)}
                onChange={() => toggle(p.name)}
              />
              <span>
                <span className="font-medium">{p.name}</span>
                {p.description ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.description}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !name.trim()}>
          Save role
        </Button>
      </div>
    </form>
  );
}
