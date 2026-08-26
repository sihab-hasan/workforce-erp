function encodeSegment(value: string) {
  return encodeURIComponent(value.trim());
}

function joinPath(base: string, path = "") {
  const suffix = path.replace(/^\/+|\/+$/g, "");
  return suffix ? `${base}/${suffix}` : base;
}

export const ERP_PATHS = {
  root: "/",
  auth: "/auth",
  signIn: "/auth/sign-in",
  loginAlias: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  mfa: "/auth/mfa",
  signOut: "/auth/sign-out",
  tenantSelect: "/select-tenant",
  tenantSwitch: "/switch-tenant",
} as const;

export function authCallbackPath(provider: string) {
  return `/auth/callback/${encodeSegment(provider)}`;
}

export function tenantPath(tenantKey: string, path = "") {
  return joinPath(`/t/${encodeSegment(tenantKey)}`, path);
}

export function companyPath(tenantKey: string, companyKey: string, path = "") {
  return joinPath(`/t/${encodeSegment(tenantKey)}/c/${encodeSegment(companyKey)}`, path);
}

export const tenantRoutes = {
  root: (tenantKey: string) => tenantPath(tenantKey),
  selectCompany: (tenantKey: string) => tenantPath(tenantKey, "select-company"),
  switchCompany: (tenantKey: string) => tenantPath(tenantKey, "switch-company"),
  organization: (tenantKey: string) => tenantPath(tenantKey, "organization"),
  organizationEdit: (tenantKey: string) => tenantPath(tenantKey, "organization/edit"),
  companies: (tenantKey: string) => tenantPath(tenantKey, "companies"),
  companyCreate: (tenantKey: string) => tenantPath(tenantKey, "companies/new"),
  companyDetails: (tenantKey: string, companyId: string) =>
    tenantPath(tenantKey, `companies/${encodeSegment(companyId)}`),
  companyEdit: (tenantKey: string, companyId: string) =>
    tenantPath(tenantKey, `companies/${encodeSegment(companyId)}/edit`),
  users: (tenantKey: string) => tenantPath(tenantKey, "users"),
  userDetails: (tenantKey: string, userId: string) =>
    tenantPath(tenantKey, `users/${encodeSegment(userId)}`),
  roles: (tenantKey: string) => tenantPath(tenantKey, "roles"),
  settings: (tenantKey: string) => tenantPath(tenantKey, "settings"),
  profileSettings: (tenantKey: string) => tenantPath(tenantKey, "settings/profile"),
  securitySettings: (tenantKey: string) => tenantPath(tenantKey, "settings/security"),
  sessionSettings: (tenantKey: string) => tenantPath(tenantKey, "settings/sessions"),
  deviceSettings: (tenantKey: string) => tenantPath(tenantKey, "settings/devices"),
  organizationSettings: (tenantKey: string) => tenantPath(tenantKey, "settings/organization"),
} as const;

export const companyRoutes = {
  root: (tenantKey: string, companyKey: string) => companyPath(tenantKey, companyKey),
  dashboard: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "dashboard"),
  departments: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "departments"),
  departmentCreate: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "departments/new"),
  departmentDetails: (tenantKey: string, companyKey: string, departmentId: string) =>
    companyPath(tenantKey, companyKey, `departments/${encodeSegment(departmentId)}`),
  departmentEdit: (tenantKey: string, companyKey: string, departmentId: string) =>
    companyPath(tenantKey, companyKey, `departments/${encodeSegment(departmentId)}/edit`),
  employees: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "employees"),
  employeeCreate: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "employees/new"),
  employeeDetails: (tenantKey: string, companyKey: string, employeeId: string) =>
    companyPath(tenantKey, companyKey, `employees/${encodeSegment(employeeId)}`),
  employeeEdit: (tenantKey: string, companyKey: string, employeeId: string) =>
    companyPath(tenantKey, companyKey, `employees/${encodeSegment(employeeId)}/edit`),
  leave: (tenantKey: string, companyKey: string) => companyPath(tenantKey, companyKey, "leave"),
  leaveCreate: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "leave/new"),
  leaveHistory: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "leave/history"),
  leaveDetails: (tenantKey: string, companyKey: string, leaveRequestId: string) =>
    companyPath(tenantKey, companyKey, `leave/${encodeSegment(leaveRequestId)}`),
  timesheets: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "timesheets"),
  timesheetCreate: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "timesheets/new"),
  timesheetDetails: (tenantKey: string, companyKey: string, timesheetId: string) =>
    companyPath(tenantKey, companyKey, `timesheets/${encodeSegment(timesheetId)}`),
  timesheetEdit: (tenantKey: string, companyKey: string, timesheetId: string) =>
    companyPath(tenantKey, companyKey, `timesheets/${encodeSegment(timesheetId)}/edit`),
  approvals: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "approvals"),
  approvalDetails: (tenantKey: string, companyKey: string, approvalId: string) =>
    companyPath(tenantKey, companyKey, `approvals/${encodeSegment(approvalId)}`),
  documents: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "documents"),
  documentUpload: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "documents/upload"),
  documentDetails: (tenantKey: string, companyKey: string, documentId: string) =>
    companyPath(tenantKey, companyKey, `documents/${encodeSegment(documentId)}`),
  reports: (tenantKey: string, companyKey: string) => companyPath(tenantKey, companyKey, "reports"),
  employeeReport: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "reports/employees"),
  leaveReport: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "reports/leave"),
  timesheetReport: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "reports/timesheets"),
  departmentReport: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "reports/departments"),
  notifications: (tenantKey: string, companyKey: string) =>
    companyPath(tenantKey, companyKey, "notifications"),
} as const;
