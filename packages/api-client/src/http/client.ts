import { ApiError } from "./errors"

export interface HttpRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, unknown>
  signal?: AbortSignal
  /** Maximum request time in milliseconds. Defaults to 15 seconds. */
  timeoutMs?: number
  /** Public requests do not trigger the global unauthorized-session handler. */
  withAuth?: boolean
  /** Skip automatic CSRF initialization for special non-browser requests. */
  withCsrf?: boolean
}

export interface ApiClientOptions {
  baseUrl: string
  /** Called when an authenticated request receives HTTP 401. */
  onUnauthorized?: (error: ApiError) => void
}

export interface ApiClient {
  baseUrl: string
  csrf(): Promise<void>
  getHealth(): Promise<{ status: string; service: string }>
  get<T>(url: string, options?: HttpRequestOptions): Promise<T>
  post<T>(url: string, data?: unknown, options?: HttpRequestOptions): Promise<T>
  put<T>(url: string, data?: unknown, options?: HttpRequestOptions): Promise<T>
  patch<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions
  ): Promise<T>
  delete<T>(url: string, options?: HttpRequestOptions): Promise<T>
}

export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return ""
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null)
          searchParams.append(`${key}[]`, String(item))
      }
    } else if (typeof value === "object") {
      searchParams.append(key, JSON.stringify(value))
    } else {
      searchParams.append(key, String(value))
    }
  }
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json"))
      return response.json() as Promise<T>
    return {} as T
  }

  let errorMessage = `API request failed with status ${response.status}`
  let errors: Record<string, string[]> | undefined
  let rawBody: unknown
  try {
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      rawBody = await response.json()
      if (rawBody && typeof rawBody === "object") {
        const parsed = rawBody as { message?: unknown; errors?: unknown }
        if (typeof parsed.message === "string") errorMessage = parsed.message
        if (parsed.errors && typeof parsed.errors === "object")
          errors = parsed.errors as Record<string, string[]>
      }
    } else rawBody = await response.text()
  } catch {}

  throw new ApiError(
    errorMessage,
    response.status,
    errors,
    rawBody,
    response.statusText
  )
}

function cookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const prefix = `${name}=`
  const item = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix))
  return item ? decodeURIComponent(item.slice(prefix.length)) : null
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "")
  let csrfPromise: Promise<void> | null = null

  function resolveUrl(url: string): string {
    if (url.startsWith("http")) return url
    const clean = url.startsWith("/") ? url : `/${url}`
    return `${baseUrl}${clean}`
  }

  async function csrf(): Promise<void> {
    if (cookie("XSRF-TOKEN")) return
    if (!csrfPromise) {
      csrfPromise = fetch(resolveUrl("/sanctum/csrf-cookie"), {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) await handleResponse(response)
        })
        .finally(() => {
          csrfPromise = null
        })
    }
    await csrfPromise
  }

  async function request<T>(
    method: string,
    url: string,
    data?: unknown,
    requestOptions?: HttpRequestOptions
  ): Promise<T> {
    let cleanUrl = url
    if (!cleanUrl.startsWith("/") && !cleanUrl.startsWith("http"))
      cleanUrl = `/${cleanUrl}`
    const queryString = buildQueryString(requestOptions?.params)
    const fullUrl = cleanUrl.startsWith("http")
      ? `${cleanUrl}${queryString ? (cleanUrl.includes("?") ? queryString.replace("?", "&") : queryString) : ""}`
      : `${baseUrl}${cleanUrl}${queryString ? (cleanUrl.includes("?") ? queryString.replace("?", "&") : queryString) : ""}`

    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())
    if (unsafe && requestOptions?.withCsrf !== false) await csrf()

    const headers = new Headers(requestOptions?.headers)
    if (!headers.has("Accept")) headers.set("Accept", "application/json")
    if (data !== undefined && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json")
    if (unsafe && !headers.has("X-XSRF-TOKEN")) {
      const xsrf = cookie("XSRF-TOKEN")
      if (xsrf) headers.set("X-XSRF-TOKEN", xsrf)
    }

    const controller = new AbortController()
    const timeoutMs = requestOptions?.timeoutMs ?? 15_000
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs)
    const externalSignal = requestOptions?.signal
    const abortFromExternal = () => controller.abort()
    externalSignal?.addEventListener("abort", abortFromExternal, { once: true })

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        signal: controller.signal,
        credentials: "include",
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      })
      return await handleResponse<T>(response)
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        if (externalSignal?.aborted) throw error
        throw new ApiError(
          `Request timed out after ${timeoutMs}ms`,
          0,
          undefined,
          error
        )
      }
      if (error instanceof ApiError) {
        if (error.status === 401 && requestOptions?.withAuth !== false)
          options.onUnauthorized?.(error)
        throw error
      }
      const message =
        error instanceof Error
          ? error.message
          : "Network error or request failed"
      throw new ApiError(message, 0, undefined, error)
    } finally {
      globalThis.clearTimeout(timeoutId)
      externalSignal?.removeEventListener("abort", abortFromExternal)
    }
  }

  return {
    baseUrl,
    csrf,
    getHealth: () =>
      request("GET", "/api/health", undefined, {
        withAuth: false,
        timeoutMs: 5_000,
      }),
    get: <T>(url: string, ro?: HttpRequestOptions) =>
      request<T>("GET", url, undefined, ro),
    post: <T>(url: string, data?: unknown, ro?: HttpRequestOptions) =>
      request<T>("POST", url, data, ro),
    put: <T>(url: string, data?: unknown, ro?: HttpRequestOptions) =>
      request<T>("PUT", url, data, ro),
    patch: <T>(url: string, data?: unknown, ro?: HttpRequestOptions) =>
      request<T>("PATCH", url, data, ro),
    delete: <T>(url: string, ro?: HttpRequestOptions) =>
      request<T>("DELETE", url, undefined, ro),
  }
}
