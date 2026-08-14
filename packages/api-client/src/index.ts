export * from "./http"

// ---------------------------------------------------------------------------
// Legacy client surface — kept for backward compatibility while the codebase
// migrates to the module-level API functions that use createHttpClient directly.
// ---------------------------------------------------------------------------

export interface ApiClientOptions {
  baseUrl: string
  /** Callback returning the current Bearer token, or null/undefined if unauthenticated. */
  getToken?: () => string | null | undefined
}

export interface ApiClient {
  baseUrl: string
  getHealth(): Promise<{ status: string; service: string }>
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const resolvedBase = options.baseUrl.replace(/\/$/, "")
  return {
    baseUrl: resolvedBase,
    async getHealth() {
      const response = await fetch(`${resolvedBase}/api/health`)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      return response.json() as Promise<{ status: string; service: string }>
    },
  }
}

