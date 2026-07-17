const portalBaseUrl = (
  import.meta.env.VITE_PORTAL_URL || "http://localhost:5174"
).replace(/\/+$/, "")

export const portalLinks = {
  login: `${portalBaseUrl}/auth/login`,
  register: `${portalBaseUrl}/auth/register`,
} as const
