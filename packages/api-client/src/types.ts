import type { QueryParams, RequestMetadata, TenantScope } from "@workforce-erp/contracts";

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  getCsrfToken?: () => string | undefined | Promise<string | undefined>;
  getTenantScope?: () => TenantScope | undefined | Promise<TenantScope | undefined>;
  getCorrelationId?: () => string | undefined;
  defaultHeaders?: HeadersInit;
  onUnauthorized?: () => void | Promise<void>;
}

export interface ApiRequestOptions<TBody = unknown> extends RequestMetadata {
  body?: TBody;
  query?: QueryParams;
  headers?: HeadersInit;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
}

export interface ApiClient {
  request<TResponse, TBody = unknown>(
    method: string,
    path: string,
    options?: ApiRequestOptions<TBody>,
  ): Promise<TResponse>;
  get<TResponse>(path: string, options?: Omit<ApiRequestOptions, "body">): Promise<TResponse>;
  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body">,
  ): Promise<TResponse>;
  put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body">,
  ): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body">,
  ): Promise<TResponse>;
  delete<TResponse>(path: string, options?: Omit<ApiRequestOptions, "body">): Promise<TResponse>;
}
