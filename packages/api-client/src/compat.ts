import { ApiError, normalizeApiProblem } from "./errors";

export interface CompatRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  timeoutMs?: number;
  withAuth?: boolean;
  withCsrf?: boolean;
}

export interface CookieApiClientOptions {
  baseUrl: string;
  onUnauthorized?: (error: ApiError) => void;
}

export interface CookieApiClient {
  baseUrl: string;
  csrf(): Promise<void>;
  getHealth(): Promise<{ status: string; service: string }>;
  get<T>(url: string, options?: CompatRequestOptions): Promise<T>;
  post<T>(url: string, data?: unknown, options?: CompatRequestOptions): Promise<T>;
  put<T>(url: string, data?: unknown, options?: CompatRequestOptions): Promise<T>;
  patch<T>(url: string, data?: unknown, options?: CompatRequestOptions): Promise<T>;
  delete<T>(url: string, options?: CompatRequestOptions): Promise<T>;
}

function buildCompatQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) searchParams.append(`${key}[]`, String(item));
      }
    } else if (typeof value === "object") {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const item = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json")
  ) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

/**
 * Cookie/CSRF-aware client retained for migrated Laravel endpoints. It lives in
 * the canonical api-client package rather than recreating the old HTTP package.
 */
export function createCookieApiClient(options: CookieApiClientOptions): CookieApiClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  let csrfPromise: Promise<void> | null = null;

  const resolveUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) return url;
    const clean = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${clean}`;
  };

  async function csrf(): Promise<void> {
    if (readCookie("XSRF-TOKEN")) return;
    if (!csrfPromise) {
      csrfPromise = fetch(resolveUrl("/sanctum/csrf-cookie"), {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) {
            const body = await parseResponseBody(response);
            throw new ApiError(response, normalizeApiProblem(response, body));
          }
        })
        .finally(() => {
          csrfPromise = null;
        });
    }
    await csrfPromise;
  }

  async function request<T>(
    method: string,
    url: string,
    data?: unknown,
    requestOptions: CompatRequestOptions = {},
  ): Promise<T> {
    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
    if (unsafe && requestOptions.withCsrf !== false) await csrf();

    const query = buildCompatQueryString(requestOptions.params);
    const resolved = resolveUrl(url);
    const fullUrl = `${resolved}${query ? (resolved.includes("?") ? query.replace("?", "&") : query) : ""}`;
    const headers = new Headers(requestOptions.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (data !== undefined && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
    if (unsafe && !headers.has("X-XSRF-TOKEN")) {
      const token = readCookie("XSRF-TOKEN");
      if (token) headers.set("X-XSRF-TOKEN", token);
    }

    const controller = new AbortController();
    const timeoutMs = requestOptions.timeoutMs ?? 15_000;
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
    const externalSignal = requestOptions.signal;
    const abortFromExternal = () => controller.abort();
    externalSignal?.addEventListener("abort", abortFromExternal, { once: true });

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        signal: controller.signal,
        credentials: "include",
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      });
      const body = await parseResponseBody(response);
      if (!response.ok) {
        const error = new ApiError(response, normalizeApiProblem(response, body));
        if (response.status === 401 && requestOptions.withAuth !== false)
          options.onUnauthorized?.(error);
        throw error;
      }
      return body as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        if (externalSignal?.aborted) throw error;
        const response = new Response(null, { status: 408, statusText: "Request Timeout" });
        throw new ApiError(response, {
          title: "Request timed out",
          status: 408,
          detail: `Request timed out after ${timeoutMs}ms`,
        });
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    }
  }

  return {
    baseUrl,
    csrf,
    getHealth: () =>
      request("GET", "/api/health", undefined, { withAuth: false, timeoutMs: 5_000 }),
    get: (url, requestOptions) => request("GET", url, undefined, requestOptions),
    post: (url, data, requestOptions) => request("POST", url, data, requestOptions),
    put: (url, data, requestOptions) => request("PUT", url, data, requestOptions),
    patch: (url, data, requestOptions) => request("PATCH", url, data, requestOptions),
    delete: (url, requestOptions) => request("DELETE", url, undefined, requestOptions),
  };
}

export function createHttpClient(
  baseUrl: string,
  onUnauthorized?: CookieApiClientOptions["onUnauthorized"],
) {
  const client = createCookieApiClient({
    baseUrl,
    ...(onUnauthorized ? { onUnauthorized } : {}),
  });
  return {
    get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) =>
      client.get<T>(path, params ? { params } : undefined),
    post: <T>(path: string, body?: unknown) => client.post<T>(path, body),
    put: <T>(path: string, body?: unknown) => client.put<T>(path, body),
    patch: <T>(path: string, body?: unknown) => client.patch<T>(path, body),
    delete: <T>(path: string) => client.delete<T>(path),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
