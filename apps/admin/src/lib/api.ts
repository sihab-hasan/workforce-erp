import { createApiClient } from "@workforce-erp/api-client"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/"

export const apiClient = createApiClient({
  baseUrl: apiBaseUrl,
})
