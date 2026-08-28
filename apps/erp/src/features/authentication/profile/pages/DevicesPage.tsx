import { ArrowLeft, Key, Laptop, Plus, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import {
  ErpPage,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

interface DeviceRecord {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "security-key";
  browser: string;
  os: string;
  lastActive: string;
  location: string;
  isCurrent?: boolean;
}

const SAMPLE_DEVICES: DeviceRecord[] = [
  {
    id: "dev-01",
    name: "MacBook Pro 16”",
    type: "desktop",
    browser: "Chrome 128 (macOS)",
    os: "macOS Sonoma 14.6",
    lastActive: "Active right now",
    location: "Dhaka, Bangladesh",
    isCurrent: true,
  },
  {
    id: "dev-02",
    name: "iPhone 15 Pro",
    type: "mobile",
    browser: "Workforce Mobile App",
    os: "iOS 17.5",
    lastActive: "Today at 08:42 AM",
    location: "Dhaka, Bangladesh",
  },
  {
    id: "dev-03",
    name: "YubiKey 5 NFC",
    type: "security-key",
    browser: "FIDO2 / WebAuthn Hardware Token",
    os: "Hardware Security Key",
    lastActive: "Yesterday at 04:15 PM",
    location: "Hardware Device",
  },
];

export default function DevicesPage() {
  const { tenantKey } = useParams();
  const backUrl = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  const handleRegisterKey = () => {
    toast.info("WebAuthn / Passkey enrollment initiated in your browser.");
  };

  const handleRevoke = (id: string) => {
    toast.success(`Device #${id} authorization revoked.`);
  };

  return (
    <ErpPage
      title="Trusted devices"
      description="Manage authorized workstations, mobile apps, and WebAuthn hardware security keys."
      actions={
        <>
          <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
            <ArrowLeft />
            Back to settings
          </Button>
          <Button onClick={handleRegisterKey}>
            <Plus />
            Register passkey or key
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered Devices"
          value={<span className="text-2xl font-bold">{SAMPLE_DEVICES.length}</span>}
        />
        <StatCard label="Current Device" value={<StatusPill value="trusted" />} />
        <StatCard label="FIDO2 Hardware Key" value={<StatusPill value="enabled" />} />
        <StatCard
          label="Biometrics Support"
          value={<span className="text-base font-semibold">Touch ID / Windows Hello</span>}
        />
      </div>

      <SectionCard
        title="Registered Hardware & Workstations"
        description="These devices are authorized to access your workspace with remember-device tokens."
      >
        <div className="divide-y divide-border rounded-xl border">
          {SAMPLE_DEVICES.map((device) => (
            <div
              key={device.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {device.type === "desktop" ? (
                    <Laptop className="size-5" />
                  ) : device.type === "mobile" ? (
                    <Smartphone className="size-5" />
                  ) : (
                    <Key className="size-5" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{device.name}</p>
                    {device.isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Current device
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {device.browser} · {device.location}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                    Last active: {device.lastActive}
                  </p>
                </div>
              </div>

              {!device.isCurrent ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRevoke(device.id)}
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  Revoke
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <ShieldCheck className="size-4" />
                  Active session
                </span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </ErpPage>
  );
}
