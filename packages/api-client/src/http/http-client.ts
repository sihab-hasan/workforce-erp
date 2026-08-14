import { ApiError } from "./api-error"

/**
 * Core HTTP transport helper. Wraps `fetch` with:
 *  - automatic JSON serialisation/deserialisation
 *  - Bearer-token injection via `getToken`
 *  - throws `ApiError` on non-2xx responses
 *
 * @param baseUrl   API base URL (no trailing slash)
 * @param getToken  Callback that synchronously returns the current Bearer token,
 *                  or `null` / `undefined` when the caller is unauthenticated.
 */
export function createHttpClient(
  baseUrl: string,
  getToken: () => string | null | undefined,
) {
  const resolvedBase = baseUrl.replace(/\/$/, "")

  async function request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown
      params?: Record<string, string | number | boolean | undefined | null>
    } = {},
  ): Promise<T> {
    const { body, params } = options

    // Build query string, omitting undefined / null values
    let url = `${resolvedBase}${path}`
    if (params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      }
      const qs = searchParams.toString()
      if (qs) url += `?${qs}`
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      let errorBody: unknown
      try {
        errorBody = await response.json()
      } catch {
        errorBody = await response.text()
      }
      throw new ApiError(response.status, response.statusText, errorBody)
    }

    // 204 No Content — return undefined cast to T
    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  return {
    get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) =>
      request<T>("GET", path, { params }),
    post: <T>(path: string, body?: unknown) =>
      request<T>("POST", path, { body }),
    put: <T>(path: string, body?: unknown) =>
      request<T>("PUT", path, { body }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>("PATCH", path, { body }),
    delete: <T>(path: string) =>
      request<T>("DELETE", path),
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>
