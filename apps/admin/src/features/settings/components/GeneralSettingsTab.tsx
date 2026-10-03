import { useState, useEffect } from "react";
import { Globe, Mail, Phone, Clock, AlertTriangle, Save, Loader2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { Switch } from "@workforce-erp/ui/components/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import type { GeneralSettings } from "../types/settings.types";

interface GeneralSettingsTabProps {
  initialData?: GeneralSettings | undefined;
  onSave: (data: GeneralSettings) => Promise<unknown>;
  isSaving: boolean;
}

export function GeneralSettingsTab({ initialData, onSave, isSaving }: GeneralSettingsTabProps) {
  const [form, setForm] = useState<GeneralSettings>({
    platform_name: "Workforce ERP Platform",
    support_email: "support@workforceerp.io",
    support_phone: "+880 1700-000000",
    platform_url: "http://localhost:8000",
    timezone: "Asia/Dhaka",
    locale: "en-US",
    maintenance_mode: false,
    maintenance_message: "System is undergoing scheduled maintenance. Please check back shortly.",
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
            <Globe className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">Platform Identity & Contact</CardTitle>
              <CardDescription className="text-xs">
                Global brand metadata and centralized support contact coordinates.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="platform_name" className="text-xs font-semibold">
                Platform Name
              </Label>
              <Input
                id="platform_name"
                value={form.platform_name}
                onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
                placeholder="Workforce ERP"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="platform_url" className="text-xs font-semibold">
                Platform Base URL
              </Label>
              <Input
                id="platform_url"
                value={form.platform_url}
                onChange={(e) => setForm({ ...form, platform_url: e.target.value })}
                placeholder="https://app.workforceerp.io"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="support_email"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <Mail className="size-3.5 text-muted-foreground" /> Support Email
              </Label>
              <Input
                id="support_email"
                type="email"
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
                placeholder="support@workforceerp.io"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="support_phone"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <Phone className="size-3.5 text-muted-foreground" /> Support Phone
              </Label>
              <Input
                id="support_phone"
                value={form.support_phone}
                onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
                placeholder="+880 1700-000000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-indigo-500" />
            <div>
              <CardTitle className="text-base font-bold">
                Localization & Regional Defaults
              </CardTitle>
              <CardDescription className="text-xs">
                Default system timezone and international language locale.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-xs font-semibold">
              Default System Timezone
            </Label>
            <select
              id="timezone"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="locale" className="text-xs font-semibold">
              Default Locale
            </Label>
            <select
              id="locale"
              value={form.locale}
              onChange={(e) => setForm({ ...form, locale: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="en-US">English (United States) - en-US</option>
              <option value="en-GB">English (United Kingdom) - en-GB</option>
              <option value="bn-BD">Bengali (Bangladesh) - bn-BD</option>
              <option value="es-ES">Spanish - es-ES</option>
              <option value="fr-FR">French - fr-FR</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border-border/60 shadow-sm backdrop-blur-sm transition-colors ${form.maintenance_mode ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20" : "bg-card/60"}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`size-5 ${form.maintenance_mode ? "text-amber-500 animate-pulse" : "text-muted-foreground"}`}
              />
              <div>
                <CardTitle className="text-base font-bold">Platform Maintenance Mode</CardTitle>
                <CardDescription className="text-xs">
                  When enabled, non-superadmin traffic will be intercepted with a maintenance
                  screen.
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={form.maintenance_mode}
              onCheckedChange={(checked) => setForm({ ...form, maintenance_mode: checked })}
            />
          </div>
        </CardHeader>
        {form.maintenance_mode && (
          <CardContent className="space-y-2 pt-0">
            <Label htmlFor="maintenance_message" className="text-xs font-semibold">
              Public Maintenance Broadcast Notice
            </Label>
            <Textarea
              id="maintenance_message"
              rows={3}
              value={form.maintenance_message}
              onChange={(e) => setForm({ ...form, maintenance_message: e.target.value })}
              placeholder="System is undergoing scheduled maintenance..."
            />
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save General Settings
        </Button>
      </div>
    </form>
  );
}
