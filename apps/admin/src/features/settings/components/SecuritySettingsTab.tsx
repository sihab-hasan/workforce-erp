import { useState, useEffect } from "react";
import { ShieldCheck, KeyRound, Save, Loader2, Network } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Switch } from "@workforce-erp/ui/components/switch";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import type { SecuritySettings } from "../types/settings.types";

interface SecuritySettingsTabProps {
  initialData?: SecuritySettings | undefined;
  onSave: (data: SecuritySettings) => Promise<unknown>;
  isSaving: boolean;
}

export function SecuritySettingsTab({ initialData, onSave, isSaving }: SecuritySettingsTabProps) {
  const [form, setForm] = useState<SecuritySettings>({
    mfa_enforcement: "optional",
    session_timeout_minutes: 60,
    max_failed_login_attempts: 5,
    password_min_length: 8,
    require_uppercase: true,
    require_numbers: true,
    require_symbols: true,
    ip_whitelist: "",
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
            <ShieldCheck className="size-5 text-emerald-500" />
            <div>
              <CardTitle className="text-base font-bold">Multi-Factor & Session Security</CardTitle>
              <CardDescription className="text-xs">
                Authentication protocols, session idle timeout, and lockout thresholds.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mfa_enforcement" className="text-xs font-semibold">
                MFA / 2FA Policy
              </Label>
              <select
                id="mfa_enforcement"
                value={form.mfa_enforcement}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mfa_enforcement: e.target.value as SecuritySettings["mfa_enforcement"],
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="optional">Optional (User choice)</option>
                <option value="required_admin">Enforce for Administrators Only</option>
                <option value="required_all">Enforce for All Workspace Users</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="session_timeout" className="text-xs font-semibold">
                Idle Session Timeout (Minutes)
              </Label>
              <Input
                id="session_timeout"
                type="number"
                min={5}
                max={1440}
                value={form.session_timeout_minutes}
                onChange={(e) =>
                  setForm({ ...form, session_timeout_minutes: Number(e.target.value) || 60 })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max_failed_attempts" className="text-xs font-semibold">
              Max Failed Login Attempts Before Account Lockout
            </Label>
            <Input
              id="max_failed_attempts"
              type="number"
              min={3}
              max={20}
              value={form.max_failed_login_attempts}
              onChange={(e) =>
                setForm({ ...form, max_failed_login_attempts: Number(e.target.value) || 5 })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="size-5 text-amber-500" />
            <div>
              <CardTitle className="text-base font-bold">Password Complexity Rules</CardTitle>
              <CardDescription className="text-xs">
                Enforce standard entropy requirements for platform operator accounts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password_min_length" className="text-xs font-semibold">
              Minimum Password Length (Characters)
            </Label>
            <Input
              id="password_min_length"
              type="number"
              min={8}
              max={32}
              value={form.password_min_length}
              onChange={(e) =>
                setForm({ ...form, password_min_length: Number(e.target.value) || 8 })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
              <span className="text-xs font-medium">Require Uppercase Letter</span>
              <Switch
                checked={form.require_uppercase}
                onCheckedChange={(c) => setForm({ ...form, require_uppercase: c })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
              <span className="text-xs font-medium">Require Numbers (0-9)</span>
              <Switch
                checked={form.require_numbers}
                onCheckedChange={(c) => setForm({ ...form, require_numbers: c })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
              <span className="text-xs font-medium">Require Special Symbols</span>
              <Switch
                checked={form.require_symbols}
                onCheckedChange={(c) => setForm({ ...form, require_symbols: c })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="size-5 text-purple-500" />
            <div>
              <CardTitle className="text-base font-bold">Operator IP Access Whitelist</CardTitle>
              <CardDescription className="text-xs">
                Restrict Platform Admin console access to specific IP ranges (leave blank to allow
                all).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="ip_whitelist" className="text-xs font-semibold">
            Allowed IP Addresses (Comma or Line Separated)
          </Label>
          <Textarea
            id="ip_whitelist"
            rows={3}
            value={form.ip_whitelist}
            onChange={(e) => setForm({ ...form, ip_whitelist: e.target.value })}
            placeholder="192.168.1.1, 10.0.0.0/24, 203.0.113.195"
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Security Policy
        </Button>
      </div>
    </form>
  );
}
