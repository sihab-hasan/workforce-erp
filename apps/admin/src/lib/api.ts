import { createApiClient } from "@workforce-erp/api-client"

export const ADMIN_AUTH_UNAUTHORIZED_EVENT =
  "workforce-erp:admin-auth-unauthorized"
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/"

export type AdminAuthUser = {
  id: string | number
  name: string
  email: string
  role?: string | null
  organization_id?: string | null
  organization_name?: string | null
}

export type AdminAuthResponse = { success: boolean; user: AdminAuthUser }

const client = createApiClient({
  baseUrl: apiBaseUrl,
  onUnauthorized: () => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event(ADMIN_AUTH_UNAUTHORIZED_EVENT))
  },
})

export const apiClient = {
  getHealth: () => client.getHealth(),
  login: (email: string, password: string) =>
    client.post<AdminAuthResponse>(
      "/api/v1/auth/login",
      { email, password, client: "admin" },
      { withAuth: false }
    ),
  requestOtp: (email: string) =>
    client.post<{ success: boolean; message?: string }>(
      "/api/v1/auth/otp/request",
      { email },
      { withAuth: false }
    ),
  verifyOtp: (email: string, code: string) =>
    client.post<AdminAuthResponse>(
      "/api/v1/auth/otp/verify",
      { email, code, client: "admin" },
      { withAuth: false }
    ),
  me: () =>
    client.get<{ success: boolean; user: AdminAuthUser }>("/api/v1/auth/me"),
  logout: () =>
    client.post<{ success: boolean; message?: string }>("/api/v1/auth/logout"),
}
