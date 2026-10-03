function normalizeBaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

function resolveOrigin(subpath: string = ""): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, "");
    return subpath ? `${origin}/${subpath.replace(/^\/+/, "")}` : origin;
  }
  return subpath ? `http://localhost:5173/${subpath.replace(/^\/+/, "")}` : "http://localhost:5173";
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const apiUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) || (apiBaseUrl ? `${apiBaseUrl}/api` : "/api");

export const env = {
  apiUrl,
  apiBaseUrl,
  // Compatibility name used by migrated big-version modules. It intentionally
  // points at the API origin (or same origin), because those modules use
  // absolute endpoint paths such as `/api/v1/users` and `/sanctum/...`.
  legacyApiBaseUrl: apiBaseUrl,
  webUrl: normalizeBaseUrl(import.meta.env.VITE_WEB_URL) || resolveOrigin(),
  erpUrl: normalizeBaseUrl(import.meta.env.VITE_ERP_URL) || resolveOrigin("erp"),
  adminUrl: normalizeBaseUrl(import.meta.env.VITE_ADMIN_URL) || resolveOrigin("admin"),
  mode: import.meta.env.MODE,
} as const;

/** Compatibility shape used by migrated feature query factories. */
export const environment = {
  appName: "Workforce ERP",
  appVersion: "1.0.0",
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  apiBaseUrl: env.apiBaseUrl,
} as const;
