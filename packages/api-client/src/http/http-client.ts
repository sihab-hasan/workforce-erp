import { createApiClient, type ApiClientOptions } from "./client"

/** Cookie-authenticated compatibility facade for feature modules. */
export function createHttpClient(
  baseUrl: string,
  onUnauthorized?: ApiClientOptions["onUnauthorized"]
) {
  const client = createApiClient({ baseUrl, onUnauthorized })
  return {
    get: <T>(
      path: string,
      params?: Record<string, string | number | boolean | undefined | null>
    ) => client.get<T>(path, { params }),
    post: <T>(path: string, body?: unknown) => client.post<T>(path, body),
    put: <T>(path: string, body?: unknown) => client.put<T>(path, body),
    patch: <T>(path: string, body?: unknown) => client.patch<T>(path, body),
    delete: <T>(path: string) => client.delete<T>(path),
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>
