import { useState } from "react";
import { Globe, ShieldCheck, Bell, Waypoints, Activity, Sliders, RefreshCw } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Spinner } from "@workforce-erp/ui/components/spinner";
import { GeneralSettingsTab } from "../components/GeneralSettingsTab";
import { SecuritySettingsTab } from "../components/SecuritySettingsTab";
import { NotificationSettingsTab } from "../components/NotificationSettingsTab";
import { TenantDefaultsTab } from "../components/TenantDefaultsTab";
import { SystemHealthTab } from "../components/SystemHealthTab";
import { useSettings } from "../hooks/use-settings";
import type {
  GeneralSettings,
  SecuritySettings,
  NotificationSettings,
  TenantDefaultSettings,
} from "../types/settings.types";

type SettingsTab = "general" | "security" | "notifications" | "tenants" | "health";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const {
    settings,
    isLoading,
    refetchSettings,
    health,
    isHealthLoading,
    refetchHealth,
    updateSettings,
    isSaving,
    clearCache,
    isClearingCache,
  } = useSettings();

  const handleSaveGeneral = async (general: GeneralSettings) => {
    await updateSettings({ general });
  };

  const handleSaveSecurity = async (security: SecuritySettings) => {
    await updateSettings({ security });
  };

  const handleSaveNotifications = async (notifications: NotificationSettings) => {
    await updateSettings({ notifications });
  };

  const handleSaveTenants = async (tenants: TenantDefaultSettings) => {
    await updateSettings({ tenants });
  };

  const tabs: {
    id: SettingsTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "general", label: "General & Branding", icon: Globe },
    { id: "security", label: "Security & Auth", icon: ShieldCheck },
    { id: "notifications", label: "Notifications & Mail", icon: Bell },
    { id: "tenants", label: "Tenant Defaults", icon: Waypoints },
    { id: "health", label: "System Health & Tools", icon: Activity },
  ];

  if (isLoading && !settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Platform Settings
            </h1>
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Sliders className="size-4" />
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure system parameters, tenant provisioning rules, and security enforcement
            policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetchSettings();
              void refetchHealth();
            }}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-1">
        {activeTab === "general" && (
          <GeneralSettingsTab
            initialData={settings?.general}
            onSave={handleSaveGeneral}
            isSaving={isSaving}
          />
        )}

        {activeTab === "security" && (
          <SecuritySettingsTab
            initialData={settings?.security}
            onSave={handleSaveSecurity}
            isSaving={isSaving}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationSettingsTab
            initialData={settings?.notifications}
            onSave={handleSaveNotifications}
            isSaving={isSaving}
          />
        )}

        {activeTab === "tenants" && (
          <TenantDefaultsTab
            initialData={settings?.tenants}
            onSave={handleSaveTenants}
            isSaving={isSaving}
          />
        )}

        {activeTab === "health" && (
          <SystemHealthTab
            health={health}
            settings={settings}
            isLoading={isHealthLoading}
            onRefresh={() => void refetchHealth()}
            onClearCache={clearCache}
            isClearingCache={isClearingCache}
          />
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
