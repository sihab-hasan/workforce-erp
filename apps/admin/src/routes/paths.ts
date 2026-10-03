function encodeSegment(value: string | number | null | undefined) {
  return encodeURIComponent(String(value ?? "").trim());
}

export const ADMIN_PATHS = {
  root: "/",
  dashboard: "/dashboard",
  signIn: "/sign-in",
  tenants: "/tenants",
  tenantCreate: "/tenants/new",
  organizations: "/organizations",
  users: "/users",
  userCreate: "/users/new",
  inquiries: "/inquiries",
  settings: "/settings",
} as const;

export function adminTenantDetailsPath(tenantId: string | number) {
  return `${ADMIN_PATHS.tenants}/${encodeSegment(tenantId)}`;
}

export function adminTenantEditPath(tenantId: string | number) {
  return `${adminTenantDetailsPath(tenantId)}/edit`;
}

export function adminOrganizationDetailsPath(organizationId: string | number) {
  return `${ADMIN_PATHS.organizations}/${encodeSegment(organizationId)}`;
}

export function adminOrganizationEditPath(organizationId: string | number) {
  return `${adminOrganizationDetailsPath(organizationId)}/edit`;
}

export function adminUserDetailsPath(userId: string | number) {
  return `${ADMIN_PATHS.users}/${encodeSegment(userId)}`;
}

export function adminUserEditPath(userId: string | number) {
  return `${adminUserDetailsPath(userId)}/edit`;
}
