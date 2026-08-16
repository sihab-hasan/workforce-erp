import { createApiClient } from "@workforce-erp/api-client"

export const AUTH_UNAUTHORIZED_EVENT = "workforce-erp:auth-unauthorized"
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/"

export function handleUnauthorized() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
}

export const apiClient = createApiClient({
  baseUrl: apiBaseUrl,
  onUnauthorized: handleUnauthorized,
})
