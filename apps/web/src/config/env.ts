function normalizeBaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const apiUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) || (apiBaseUrl ? `${apiBaseUrl}/api` : "/api");

export const env = {
  apiUrl,
  apiBaseUrl,
  webUrl: normalizeBaseUrl(import.meta.env.VITE_WEB_URL) || "http://localhost:5173",
  erpUrl: normalizeBaseUrl(import.meta.env.VITE_ERP_URL) || "http://localhost:5174",
  adminUrl: normalizeBaseUrl(import.meta.env.VITE_ADMIN_URL) || "http://localhost:5175",
  mode: import.meta.env.MODE,
} as const;
