import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, Textarea } from "#components/erp/FormControls";
import { ErpPage, ErrorState, LoadingState, SectionCard } from "#components/erp/ErpPage";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
type Profile = {
  user: { id: string; name: string; email: string };
  employee: {
    phone?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
  } | null;
};
export default function ProfileSettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profile"], queryFn: () => apiGet<Profile>("/api/v1/profile") });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });
  useEffect(() => {
    if (q.data)
      setForm({
        name: q.data.user.name,
        email: q.data.user.email,
        phone: q.data.employee?.phone ?? "",
        address: q.data.employee?.address ?? "",
        emergency_contact_name: q.data.employee?.emergency_contact_name ?? "",
        emergency_contact_phone: q.data.employee?.emergency_contact_phone ?? "",
      });
  }, [q.data]);
  const m = useMutation({
    mutationFn: () => apiPut<Profile>("/api/v1/profile", form),
    onSuccess: () => {
      toast.success("Profile updated");
      void qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <ErpPage
      title="Profile settings"
      description="Manage your personal identity and linked employee contact details."
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <SectionCard title="Personal profile">
          <form
            className="grid gap-5 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
          >
            <Field label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Emergency contact">
              <Input
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
              />
            </Field>
            <Field label="Emergency phone">
              <Input
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
              />
            </Field>
            <div />
            <div className="md:col-span-2">
              <Field label="Address">
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Field>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={m.isPending}>
                Save profile
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
    </ErpPage>
  );
}
