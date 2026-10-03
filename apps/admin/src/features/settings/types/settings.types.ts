export interface GeneralSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  platform_url: string;
  timezone: string;
  locale: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export interface SecuritySettings {
  mfa_enforcement: "optional" | "required_admin" | "required_all";
  session_timeout_minutes: number;
  max_failed_login_attempts: number;
  password_min_length: number;
  require_uppercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  ip_whitelist: string;
}

export interface NotificationSettings {
  email_driver: string;
  alert_on_new_tenant: boolean;
  alert_on_new_inquiry: boolean;
  alert_on_security_event: boolean;
  sound_alerts_enabled: boolean;
  admin_notification_emails: string;
}

export interface TenantDefaultSettings {
  default_trial_days: number;
  allow_self_registration: boolean;
  default_storage_quota_gb: number;
  auto_tenant_provisioning: boolean;
  default_plan: "starter" | "pro" | "business" | "enterprise";
}

export interface PlatformSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  tenants: TenantDefaultSettings;
}

export interface SystemHealthData {
  app_name: string;
  environment: string;
  php_version: string;
  laravel_version: string;
  database: "healthy" | "degraded" | "disconnected";
  db_driver: string;
  uptime: string;
  server_time: string;
  memory_usage_mb: number;
}
