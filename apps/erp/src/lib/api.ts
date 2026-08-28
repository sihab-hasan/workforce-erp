import {
  createApiClient,
  createCookieApiClient,
  type ApiClientOptions,
  type CompatRequestOptions,
} from "@workforce-erp/api-client";
import { apiConfig } from "#config/api";
import { env } from "#config/env";

export const AUTH_UNAUTHORIZED_EVENT = "workforce-erp:auth-unauthorized";

let stepUpHandler: (() => Promise<void>) | null = null;
let stepUpInFlight: Promise<void> | null = null;

export function registerStepUpHandler(handler: () => Promise<void>) {
  stepUpHandler = handler;
  return () => {
    if (stepUpHandler === handler) stepUpHandler = null;
  };
}

async function handleStepUpRequired() {
  if (!stepUpHandler) throw new Error("Identity verification is required for this action.");
  if (!stepUpInFlight) {
    stepUpInFlight = stepUpHandler().finally(() => {
      stepUpInFlight = null;
    });
  }
  await stepUpInFlight;
}

export function handleUnauthorized() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

function routeScopeHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const path = window.location.pathname;
  const tenant = path.match(/\/t\/([^/]+)/)?.[1];
  const company = path.match(/\/t\/[^/]+\/c\/([^/]+)/)?.[1];
  return {
    ...(tenant ? { "X-Tenant-Key": decodeURIComponent(tenant) } : {}),
    ...(company ? { "X-Company-Key": decodeURIComponent(company) } : {}),
  };
}

function withScope(options: CompatRequestOptions = {}): CompatRequestOptions {
  return {
    ...options,
    headers: {
      ...routeScopeHeaders(),
      ...options.headers,
    },
  };
}

/** Canonical scoped API client for minimized features. */
export function createAppApiClient(options: Omit<ApiClientOptions, "baseUrl"> = {}) {
  return createApiClient({
    ...apiConfig,
    ...options,
    getTenantScope: () => {
      const headers = routeScopeHeaders();
      const tenantKey = headers["X-Tenant-Key"];
      if (!tenantKey) return undefined;

      const companyKey = headers["X-Company-Key"];
      return {
        tenantKey,
        ...(companyKey ? { companyKey } : {}),
      };
    },
  });
}

const rawApiClient = createCookieApiClient({
  baseUrl: env.legacyApiBaseUrl,
  onUnauthorized: handleUnauthorized,
  onStepUpRequired: handleStepUpRequired,
});

/** Cookie/CSRF Laravel facade with automatic tenant/company route scope. */
export const apiClient = {
  baseUrl: rawApiClient.baseUrl,
  csrf: rawApiClient.csrf,
  getHealth: rawApiClient.getHealth,
  get: <T>(url: string, options?: CompatRequestOptions) =>
    rawApiClient.get<T>(url, withScope(options)),
  post: <T>(url: string, data?: unknown, options?: CompatRequestOptions) =>
    rawApiClient.post<T>(url, data, withScope(options)),
  put: <T>(url: string, data?: unknown, options?: CompatRequestOptions) =>
    rawApiClient.put<T>(url, data, withScope(options)),
  patch: <T>(url: string, data?: unknown, options?: CompatRequestOptions) =>
    rawApiClient.patch<T>(url, data, withScope(options)),
  delete: <T>(url: string, options?: CompatRequestOptions) =>
    rawApiClient.delete<T>(url, withScope(options)),
};

/** Scoped HttpClient compatible with module API factories (users, timesheets, etc.) */
export const scopedHttpClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) =>
    apiClient.get<T>(path, params ? { params: params as Record<string, unknown> } : undefined),
  post: <T>(path: string, body?: unknown) => apiClient.post<T>(path, body),
  put: <T>(path: string, body?: unknown) => apiClient.put<T>(path, body),
  patch: <T>(path: string, body?: unknown) => apiClient.patch<T>(path, body),
  delete: <T>(path: string) => apiClient.delete<T>(path),
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const item = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

/** Multipart helper for document uploads while retaining Sanctum + scope headers. */
export async function uploadForm<T>(url: string, formData: FormData): Promise<T> {
  await rawApiClient.csrf();
  const headers = new Headers(routeScopeHeaders());
  headers.set("Accept", "application/json");
  const xsrf = readCookie("XSRF-TOKEN");
  if (xsrf) headers.set("X-XSRF-TOKEN", xsrf);
  const response = await fetch(`${env.legacyApiBaseUrl}${url}`, {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message ?? `Upload failed (${response.status})`);
  return body as T;
}

export async function downloadFile(url: string, fallbackName: string): Promise<void> {
  const response = await fetch(`${env.legacyApiBaseUrl}${url}`, {
    credentials: "include",
    headers: { Accept: "application/octet-stream", ...routeScopeHeaders() },
  });
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
