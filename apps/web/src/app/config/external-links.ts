const portalBaseUrl = (
  import.meta.env.VITE_PORTAL_URL || "http://localhost:5174/portal"
).replace(/\/+$/, "")

export const portalLinks = {
  login: `${portalBaseUrl}/auth/login`,
} as const
