function encodeSegment(value: string) {
  return encodeURIComponent(value.trim());
}

export const ADMIN_PATHS = {
  root: "/admin",
  dashboard: "/admin/dashboard",
  signIn: "/auth/sign-in",
  loginAlias: "/auth/login",
  tenants: "/admin/tenants",
  tenantCreate: "/admin/tenants/new",
  organizations: "/admin/organizations",
  users: "/admin/users",
  userCreate: "/admin/users/new",
  roles: "/admin/roles",
  capabilityMatrix: "/admin/roles/capabilities",
  settings: "/admin/settings",
} as const;

export function adminTenantDetailsPath(tenantId: string) {
  return `${ADMIN_PATHS.tenants}/${encodeSegment(tenantId)}`;
}

export function adminTenantEditPath(tenantId: string) {
  return `${adminTenantDetailsPath(tenantId)}/edit`;
}

export function adminOrganizationDetailsPath(organizationId: string) {
  return `${ADMIN_PATHS.organizations}/${encodeSegment(organizationId)}`;
}

export function adminOrganizationEditPath(organizationId: string) {
  return `${adminOrganizationDetailsPath(organizationId)}/edit`;
}

export function adminUserDetailsPath(userId: string) {
  return `${ADMIN_PATHS.users}/${encodeSegment(userId)}`;
}

export function adminUserEditPath(userId: string) {
  return `${adminUserDetailsPath(userId)}/edit`;
}

export function adminRoleDetailsPath(roleId: string) {
  return `${ADMIN_PATHS.roles}/${encodeSegment(roleId)}`;
}
