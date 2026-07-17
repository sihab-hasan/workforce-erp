export interface ApiClientOptions {
  baseUrl: string
}

export interface ApiClient {
  baseUrl: string
  getHealth(): Promise<{ status: string; service: string }>
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return {
    baseUrl: options.baseUrl.replace(/\/$/, ""),
    async getHealth() {
      const response = await fetch(`${this.baseUrl}/api/health`)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      return response.json() as Promise<{ status: string; service: string }>
    },
  }
}
