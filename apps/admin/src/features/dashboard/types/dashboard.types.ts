export interface PlatformMetrics {
  mrr: number;
  mrrGrowth: string;
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  tenantsGrowth: string;
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
  suspendedUsers: number;
  usersGrowth: string;
  securityEvents: number;
  activeSessions: number;
  mfaEnforcementRate: string;
}

export interface GrowthDataPoint {
  date: string;
  label: string;
  totalUsers: number;
  totalTenants: number;
  newUsers: number;
  newTenants: number;
  mrr: number;
  securityEvents: number;
}

export interface PlanBreakdownItem {
  name: string;
  value: number;
  color: string;
  price: string;
}

export interface ModuleAdoptionItem {
  module: string;
  active: number;
  usagePct: number;
  trend: string;
}

export interface AuditEventItem {
  id: string;
  action: string;
  actor: string;
  ip: string;
  success: boolean;
  created_at: string;
  severity: "info" | "warning" | "success" | "critical";
}

export interface TopOrganizationItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  members_count: number;
  employees_count: number;
  created_at: string;
}

export interface SystemHealthStatus {
  status: "operational" | "degraded" | "outage";
  uptimePct: number;
  apiLatencyMs: number;
  databaseStatus: string;
  cacheHitRate: number;
  activeWorkers: number;
  phpVersion: string;
  laravelVersion: string;
}

export interface PlatformAnalytics {
  metrics: PlatformMetrics;
  growthTimeseries: GrowthDataPoint[];
  plansBreakdown: PlanBreakdownItem[];
  moduleAdoption: ModuleAdoptionItem[];
  recentAudit: AuditEventItem[];
  topOrganizations: TopOrganizationItem[];
  systemHealth: SystemHealthStatus;
}
