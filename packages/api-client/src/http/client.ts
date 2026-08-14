import { ApiError } from "./errors"

export interface HttpRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, any>
  signal?: AbortSignal
}

export interface ApiClientOptions {
  baseUrl: string
  getToken?: () => string | null
}

export interface ApiClient {
  baseUrl: string
  getHealth(): Promise<{ status: string; service: string }>
  get<T>(url: string, options?: HttpRequestOptions): Promise<T>
  post<T>(url: string, data?: any, options?: HttpRequestOptions): Promise<T>
  put<T>(url: string, data?: any, options?: HttpRequestOptions): Promise<T>
  patch<T>(url: string, data?: any, options?: HttpRequestOptions): Promise<T>
  delete<T>(url: string, options?: HttpRequestOptions): Promise<T>
}

/**
 * Builds a query string from a key-value object, formatting array values as `key[]=value`
 * as expected by standard backend frameworks like Laravel.
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return ""

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(`${key}[]`, String(item))
        }
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

/**
 * Helper to process and normalize the Fetch response.
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return response.json() as Promise<T>
    }
    return {} as T
  }

  let errorMessage = `API request failed with status ${response.status}`
  let errors: Record<string, string[]> | undefined
  let rawBody: any

  try {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      rawBody = await response.json()
      if (rawBody) {
        if (typeof rawBody.message === "string") {
          errorMessage = rawBody.message
        }
        if (rawBody.errors && typeof rawBody.errors === "object") {
          errors = rawBody.errors
        }
      }
    } else {
      rawBody = await response.text()
    }
  } catch (e) {
    // Ignore parsing errors and keep default message
  }

  throw new ApiError(errorMessage, response.status, errors, rawBody)
}

/**
 * Creates a configured instance of the shared ApiClient.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "")

  // Default to standard token storage key if no getter function is provided
  const getToken =
    options.getToken ||
    (() => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("workforce-erp.auth.token")
      }
      return null
    })

  async function request<T>(
    method: string,
    url: string,
    data?: any,
    requestOptions?: HttpRequestOptions
  ): Promise<T> {
    let cleanUrl = url
    if (!cleanUrl.startsWith("/") && !cleanUrl.startsWith("http")) {
      cleanUrl = `/${cleanUrl}`
    }

    const queryString = buildQueryString(requestOptions?.params)
    const fullUrl = cleanUrl.startsWith("http")
      ? `${cleanUrl}${queryString ? (cleanUrl.includes("?") ? `${queryString.replace("?", "&")}` : queryString) : ""}`
      : `${baseUrl}${cleanUrl}${queryString ? (cleanUrl.includes("?") ? `${queryString.replace("?", "&")}` : queryString) : ""}`

    const headers = new Headers(requestOptions?.headers)

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json")
    }
    if (data !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    const token = getToken()
    if (token) {
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      if (!headers.has("X-API-TOKEN")) {
        headers.set("X-API-TOKEN", token)
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: requestOptions?.signal,
    }

    if (data !== undefined) {
      fetchOptions.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(fullUrl, fetchOptions)
      return await handleResponse<T>(response)
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw error
      }
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error.message || "Network error or request failed",
        0,
        undefined,
        error
      )
    }
  }

  return {
    baseUrl,
    async getHealth() {
      return request<{ status: string; service: string }>("GET", "/api/health")
    },
    get<T>(url: string, requestOptions?: HttpRequestOptions) {
      return request<T>("GET", url, undefined, requestOptions)
    },
    post<T>(url: string, data?: any, requestOptions?: HttpRequestOptions) {
      return request<T>("POST", url, data, requestOptions)
    },
    put<T>(url: string, data?: any, requestOptions?: HttpRequestOptions) {
      return request<T>("PUT", url, data, requestOptions)
    },
    patch<T>(url: string, data?: any, requestOptions?: HttpRequestOptions) {
      return request<T>("PATCH", url, data, requestOptions)
    },
    delete<T>(url: string, requestOptions?: HttpRequestOptions) {
      return request<T>("DELETE", url, undefined, requestOptions)
    },
  }
}
