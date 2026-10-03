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
  webUrl: normalizeBaseUrl(import.meta.env.VITE_WEB_URL) || resolveOrigin(),
  erpUrl: normalizeBaseUrl(import.meta.env.VITE_ERP_URL) || resolveOrigin("erp"),
  adminUrl: normalizeBaseUrl(import.meta.env.VITE_ADMIN_URL) || resolveOrigin("admin"),
  mode: import.meta.env.MODE,
} as const;
