function normalizeBaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const apiUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) || (apiBaseUrl ? `${apiBaseUrl}/api` : "/api");
const erpUrl = normalizeBaseUrl(import.meta.env.VITE_ERP_URL) || "http://localhost:5174";

export const env = {
  apiUrl,
  apiBaseUrl,
  webUrl: normalizeBaseUrl(import.meta.env.VITE_WEB_URL) || "http://localhost:5173",
  erpUrl,
  adminUrl: normalizeBaseUrl(import.meta.env.VITE_ADMIN_URL) || "http://localhost:5175",
  // Compatibility property used by the transferred Admin auth page.
  portalUrl: erpUrl,
  mode: import.meta.env.MODE,
} as const;

/** Compatibility shape used by migrated big-version feature query factories. */
export const environment = {
  appName: "Workforce ERP Admin",
  appVersion: "1.0.0",
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  apiBaseUrl: env.apiBaseUrl,
} as const;
