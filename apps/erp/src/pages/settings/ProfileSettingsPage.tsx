import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

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
  const { tenantKey } = useParams();
  const qc = useQueryClient();
  const backUrl = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  const q = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<Profile>("/api/v1/profile"),
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (q.data) {
      setForm({
        name: q.data.user.name ?? "",
        email: q.data.user.email ?? "",
        phone: q.data.employee?.phone ?? "",
        address: q.data.employee?.address ?? "",
        emergency_contact_name: q.data.employee?.emergency_contact_name ?? "",
        emergency_contact_phone: q.data.employee?.emergency_contact_phone ?? "",
      });
    }
  }, [q.data]);

  const m = useMutation({
    mutationFn: () => apiPut<Profile>("/api/v1/profile", form),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      void qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (q.isLoading) {
    return (
      <ErpPage title="Profile settings" description="Loading profile information…">
        <LoadingState label="Loading profile…" />
      </ErpPage>
    );
  }

  if (q.isError || !q.data) {
    return (
      <ErpPage title="Profile settings" description="Manage personal identity">
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      </ErpPage>
    );
  }

  return (
    <ErpPage
      title="Profile settings"
      description="Manage your personal identity, contact channels, and emergency details."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to settings
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Account Status" value={<StatusPill value="active" />} />
        <StatCard
          label="Profile Name"
          value={<span className="text-base font-semibold">{form.name || "—"}</span>}
        />
        <StatCard
          label="Primary Email"
          value={<span className="text-sm font-medium truncate">{form.email || "—"}</span>}
        />
        <StatCard
          label="Emergency Contact"
          value={
            <span className="text-base font-semibold">
              {form.emergency_contact_name || "Unassigned"}
            </span>
          }
        />
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <SectionCard
          title="Personal Information"
          description="Your verified identity attributes and direct contact channels"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jane Cooper"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email">
                Work Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-email"
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. jane.cooper@workforce.internal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Contact Phone</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +880 1711 223344"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-address">Mailing Address</Label>
              <Input
                id="profile-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. Gulshan-2, Dhaka 1212"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Emergency Contact"
          description="Designated person to reach in the event of an urgent workplace incident"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="emergency-name">Emergency Contact Name</Label>
              <Input
                id="emergency-name"
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                placeholder="e.g. Devon Lane (Spouse)"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emergency-phone">Emergency Phone Number</Label>
              <Input
                id="emergency-phone"
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                placeholder="e.g. +880 1819 998877"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={m.isPending}>
            {m.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </div>
      </form>
    </ErpPage>
  );
}
