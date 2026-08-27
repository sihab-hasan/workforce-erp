import { ApiError, normalizeApiProblem } from "./errors";
import { buildQueryString } from "./query";
import type { ApiClient, ApiClientOptions, ApiRequestOptions } from "./types";

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json")
  ) {
    return response.json();
  }
  return response.text();
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetcher = options.fetch ?? globalThis.fetch.bind(globalThis);

  async function request<TResponse, TBody = unknown>(
    method: string,
    path: string,
    req: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const [token, csrfToken, scope] = await Promise.all([
      options.getAccessToken?.(),
      options.getCsrfToken?.(),
      options.getTenantScope?.(),
    ]);

    const headers = new Headers(options.defaultHeaders);
    new Headers(req.headers).forEach((value, key) => headers.set(key, value));

    headers.set("Accept", headers.get("Accept") ?? "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (csrfToken) headers.set("X-XSRF-TOKEN", csrfToken);
    if (scope?.tenantKey) headers.set("X-Tenant-Key", scope.tenantKey);
    if (scope?.companyKey) headers.set("X-Company-Key", scope.companyKey);

    const correlationId = req.correlationId ?? options.getCorrelationId?.();
    if (correlationId) headers.set("X-Correlation-Id", correlationId);
    if (req.idempotencyKey) headers.set("Idempotency-Key", req.idempotencyKey);

    let body: BodyInit | undefined;
    if (req.body !== undefined) {
      headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
      body = headers.get("Content-Type")?.includes("application/json")
        ? JSON.stringify(req.body)
        : String(req.body);
    }

    const init: RequestInit = {
      method,
      headers,
      credentials: req.credentials ?? options.credentials ?? "include",
    };
    if (body !== undefined) init.body = body;
    if (req.signal !== undefined) init.signal = req.signal;

    const response = await fetcher(
      joinUrl(options.baseUrl, path) + buildQueryString(req.query),
      init,
    );

    const parsed = await parseBody(response);
    if (!response.ok) {
      if (response.status === 401) await options.onUnauthorized?.();
      throw new ApiError(response, normalizeApiProblem(response, parsed));
    }

    return parsed as TResponse;
  }

  return {
    request,
    get: (path, requestOptions) => request("GET", path, requestOptions),
    post: (path, body, requestOptions) => request("POST", path, { ...requestOptions, body }),
    put: (path, body, requestOptions) => request("PUT", path, { ...requestOptions, body }),
    patch: (path, body, requestOptions) => request("PATCH", path, { ...requestOptions, body }),
    delete: (path, requestOptions) => request("DELETE", path, requestOptions),
  };
}
