import { useState, useEffect } from "react";
import { Waypoints, Database, Save, Loader2, Zap } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Switch } from "@workforce-erp/ui/components/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import type { TenantDefaultSettings } from "../types/settings.types";

interface TenantDefaultsTabProps {
  initialData?: TenantDefaultSettings | undefined;
  onSave: (data: TenantDefaultSettings) => Promise<unknown>;
  isSaving: boolean;
}

export function TenantDefaultsTab({ initialData, onSave, isSaving }: TenantDefaultsTabProps) {
  const [form, setForm] = useState<TenantDefaultSettings>({
    default_trial_days: 14,
    allow_self_registration: true,
    default_storage_quota_gb: 10,
    auto_tenant_provisioning: true,
    default_plan: "pro",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Waypoints className="size-5 text-cyan-500" />
            <div>
              <CardTitle className="text-base font-bold">Tenant Workspace Provisioning</CardTitle>
              <CardDescription className="text-xs">
                Default parameters applied when new organizations sign up or are created.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="default_plan" className="text-xs font-semibold">
                Default Assigned Tier Plan
              </Label>
              <select
                id="default_plan"
                value={form.default_plan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    default_plan: e.target.value as TenantDefaultSettings["default_plan"],
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="starter">Starter Plan ($49/mo)</option>
                <option value="pro">Professional Plan ($199/mo)</option>
                <option value="business">Business Plan ($299/mo)</option>
                <option value="enterprise">Enterprise Plan ($499/mo)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trial_days" className="text-xs font-semibold">
                Trial Duration Period (Days)
              </Label>
              <Input
                id="trial_days"
                type="number"
                min={0}
                max={90}
                value={form.default_trial_days}
                onChange={(e) =>
                  setForm({ ...form, default_trial_days: Number(e.target.value) || 14 })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="storage_quota"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <Database className="size-3.5 text-muted-foreground" /> Storage Quota (GB)
              </Label>
              <Input
                id="storage_quota"
                type="number"
                min={1}
                max={500}
                value={form.default_storage_quota_gb}
                onChange={(e) =>
                  setForm({ ...form, default_storage_quota_gb: Number(e.target.value) || 10 })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 bg-muted/20">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Allow Public Self-Registration
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Permit new companies to create accounts directly via the web portal.
                </div>
              </div>
              <Switch
                checked={form.allow_self_registration}
                onCheckedChange={(c) => setForm({ ...form, allow_self_registration: c })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 bg-muted/20">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Auto Tenant Provisioning
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Instantly provision schema, seed default branches & HR roles.
                  </div>
                </div>
              </div>
              <Switch
                checked={form.auto_tenant_provisioning}
                onCheckedChange={(c) => setForm({ ...form, auto_tenant_provisioning: c })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Tenant Defaults
        </Button>
      </div>
    </form>
  );
}
