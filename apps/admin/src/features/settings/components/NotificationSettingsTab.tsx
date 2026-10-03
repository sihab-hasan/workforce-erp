import { useState, useEffect } from "react";
import { Bell, Mail, Volume2, Save, Loader2 } from "lucide-react";
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
import type { NotificationSettings } from "../types/settings.types";

interface NotificationSettingsTabProps {
  initialData?: NotificationSettings | undefined;
  onSave: (data: NotificationSettings) => Promise<unknown>;
  isSaving: boolean;
}

export function NotificationSettingsTab({
  initialData,
  onSave,
  isSaving,
}: NotificationSettingsTabProps) {
  const [form, setForm] = useState<NotificationSettings>({
    email_driver: "smtp",
    alert_on_new_tenant: true,
    alert_on_new_inquiry: true,
    alert_on_security_event: true,
    sound_alerts_enabled: true,
    admin_notification_emails: "admin@workforceerp.io",
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
            <Bell className="size-5 text-rose-500" />
            <div>
              <CardTitle className="text-base font-bold">
                Platform Event Alert Subscriptions
              </CardTitle>
              <CardDescription className="text-xs">
                Select which system triggers should generate real-time in-app alerts and
                notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 bg-muted/20">
            <div>
              <div className="text-xs font-semibold text-foreground">
                New Customer Contact Inquiries (#119)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Trigger real-time notification bell update when public contact forms are submitted.
              </div>
            </div>
            <Switch
              checked={form.alert_on_new_inquiry}
              onCheckedChange={(c) => setForm({ ...form, alert_on_new_inquiry: c })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 bg-muted/20">
            <div>
              <div className="text-xs font-semibold text-foreground">
                New Tenant Workspace Registrations
              </div>
              <div className="text-[11px] text-muted-foreground">
                Alert operators whenever a new organization registers or provisions a workspace.
              </div>
            </div>
            <Switch
              checked={form.alert_on_new_tenant}
              onCheckedChange={(c) => setForm({ ...form, alert_on_new_tenant: c })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 bg-muted/20">
            <div>
              <div className="text-xs font-semibold text-foreground">
                Critical Security Audit Alerts
              </div>
              <div className="text-[11px] text-muted-foreground">
                Notify on repeated failed logins, break-glass session triggers, and permission
                escalations.
              </div>
            </div>
            <Switch
              checked={form.alert_on_security_event}
              onCheckedChange={(c) => setForm({ ...form, alert_on_security_event: c })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 bg-muted/20">
            <div className="flex items-center gap-2">
              <Volume2 className="size-4 text-amber-500" />
              <div>
                <div className="text-xs font-semibold text-foreground">In-App Audio Chimes</div>
                <div className="text-[11px] text-muted-foreground">
                  Play subtle audio chime when urgent real-time notification popups arrive.
                </div>
              </div>
            </div>
            <Switch
              checked={form.sound_alerts_enabled}
              onCheckedChange={(c) => setForm({ ...form, sound_alerts_enabled: c })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-blue-500" />
            <div>
              <CardTitle className="text-base font-bold">Email Dispatch Settings</CardTitle>
              <CardDescription className="text-xs">
                Email driver configuration and platform administrative delivery target addresses.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email_driver" className="text-xs font-semibold">
                Mail Provider Driver
              </Label>
              <select
                id="email_driver"
                value={form.email_driver}
                onChange={(e) => setForm({ ...form, email_driver: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="smtp">Standard SMTP Server</option>
                <option value="postmark">Postmark Gateway</option>
                <option value="mailgun">Mailgun API</option>
                <option value="ses">Amazon SES</option>
                <option value="log">Local Log / Mock Driver</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin_emails" className="text-xs font-semibold">
                Operator Notification Email Recipients
              </Label>
              <Input
                id="admin_emails"
                value={form.admin_notification_emails}
                onChange={(e) => setForm({ ...form, admin_notification_emails: e.target.value })}
                placeholder="admin@workforceerp.io, ops@workforceerp.io"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Notification Preferences
        </Button>
      </div>
    </form>
  );
}
