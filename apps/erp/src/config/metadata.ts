import { matchPath } from "react-router-dom";
import { appConfig } from "#config/app";

export interface RouteMetadataDefinition {
  path: string;
  title: string;
  description: string;
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  robots: string;
}

const routes: RouteMetadataDefinition[] = [
  {
    path: "/sign-in",
    title: "Sign in",
    description: "Sign in securely to your Workforce ERP workspace.",
  },
  {
    path: "/sign-up",
    title: "Create organization",
    description: "Sign in securely to your Workforce ERP workspace.",
  },
  {
    path: "/forgot-password",
    title: "Forgot password",
    description: "Request a secure password reset for your Workforce ERP account.",
  },
  {
    path: "/reset-password",
    title: "Reset password",
    description: "Choose a new password for your Workforce ERP account.",
  },
  {
    path: "/verify-sign-in",
    title: "Verification",
    description: "Complete multi-factor verification to continue to Workforce ERP.",
  },
  {
    path: "/sso/callback/:provider",
    title: "Completing sign in",
    description: "Completing secure single sign-on for Workforce ERP.",
  },
  {
    path: "/sign-out",
    title: "Signing out",
    description: "Securely ending your Workforce ERP session.",
  },
  {
    path: "/select-tenant",
    title: "Select organization",
    description: "Choose the organization workspace you want to access.",
  },
  {
    path: "/switch-tenant",
    title: "Switch organization",
    description: "Switch to another organization workspace.",
  },
  {
    path: "/t/:tenantKey/select-company",
    title: "Select company",
    description: "Choose a company within your organization workspace.",
  },
  {
    path: "/t/:tenantKey/switch-company",
    title: "Switch company",
    description: "Switch to another company in the current organization.",
  },
  {
    path: "/t/:tenantKey/organization/edit",
    title: "Edit organization",
    description: "Update organization profile and workspace information.",
  },
  {
    path: "/t/:tenantKey/organization",
    title: "Organization",
    description: "Review organization profile and workspace information.",
  },
  {
    path: "/t/:tenantKey/companies/new",
    title: "Create company",
    description: "Create a company in the current organization.",
  },
  {
    path: "/t/:tenantKey/companies/:companyId/edit",
    title: "Edit company",
    description: "Update company information and configuration.",
  },
  {
    path: "/t/:tenantKey/companies/:companyId",
    title: "Company details",
    description: "Review company information and workspace details.",
  },
  {
    path: "/t/:tenantKey/companies",
    title: "Companies",
    description: "Manage companies in the current organization.",
  },
  {
    path: "/t/:tenantKey/users/:userId",
    title: "User details",
    description: "Review user account, roles, and access information.",
  },
  {
    path: "/t/:tenantKey/users",
    title: "Users",
    description: "Manage organization users and access.",
  },
  {
    path: "/t/:tenantKey/roles",
    title: "Roles",
    description: "Review organization roles and access assignments.",
  },
  {
    path: "/t/:tenantKey/settings/profile",
    title: "Profile settings",
    description: "Manage your Workforce ERP profile.",
  },
  {
    path: "/t/:tenantKey/settings/security",
    title: "Sign-in & Verification",
    description: "Manage password and account security settings.",
  },
  {
    path: "/t/:tenantKey/settings/sessions",
    title: "Active sessions",
    description: "Review and revoke active Workforce ERP sessions.",
  },
  {
    path: "/t/:tenantKey/settings/devices",
    title: "Devices",
    description: "Review devices associated with your account.",
  },
  {
    path: "/t/:tenantKey/settings/organization",
    title: "Organization settings",
    description: "Manage organization-wide configuration.",
  },
  {
    path: "/t/:tenantKey/settings",
    title: "Settings",
    description: "Manage account and organization settings.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/dashboard",
    title: "Dashboard",
    description: "Overview of workforce activity, attendance, leave, and company operations.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/departments/new",
    title: "Create department",
    description: "Create a department in the current company.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/departments/:departmentId/edit",
    title: "Edit department",
    description: "Update department information and structure.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/departments/:departmentId",
    title: "Department details",
    description: "Review department information and workforce structure.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/departments",
    title: "Departments",
    description: "Manage company departments and organizational structure.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/employees/new",
    title: "Add employee",
    description: "Create a new employee record in the current company.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/employees/:employeeId/edit",
    title: "Edit employee",
    description: "Update employee profile and employment information.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/employees/:employeeId",
    title: "Employee details",
    description: "Review employee profile, employment, and workforce information.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/employees",
    title: "Employees",
    description: "Manage employee records and workforce information.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/leave/new",
    title: "Request leave",
    description: "Create a new leave request.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/leave/history",
    title: "Leave history",
    description: "Review historical leave requests and decisions.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/leave/:leaveRequestId",
    title: "Leave request details",
    description: "Review leave request details and approval status.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/leave",
    title: "Leave",
    description: "Manage leave requests, balances, and approvals.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/timesheets/new",
    title: "Create timesheet",
    description: "Create a timesheet entry for the current company.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/timesheets/:timesheetId/edit",
    title: "Edit timesheet",
    description: "Update a timesheet entry.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/timesheets/:timesheetId",
    title: "Timesheet details",
    description: "Review tracked working time and timesheet details.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/timesheets",
    title: "Timesheets",
    description: "Track and manage employee working time.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/approvals/:approvalId",
    title: "Approval details",
    description: "Review an approval request and its workflow status.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/approvals",
    title: "Approvals",
    description: "Review and manage pending workflow approvals.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/documents/upload",
    title: "Upload document",
    description: "Upload a document to the company workspace.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/documents/:documentId",
    title: "Document details",
    description: "Review document information and attachments.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/documents",
    title: "Documents",
    description: "Manage company documents and workforce files.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/reports/employees",
    title: "Employee report",
    description: "Analyze employee and workforce information.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/reports/leave",
    title: "Leave report",
    description: "Analyze company leave activity and trends.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/reports/timesheets",
    title: "Timesheet report",
    description: "Analyze tracked working time and timesheet activity.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/reports/departments",
    title: "Department report",
    description: "Analyze workforce distribution across departments.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/reports",
    title: "Reports",
    description: "Access workforce, leave, timesheet, and department reports.",
  },
  {
    path: "/t/:tenantKey/c/:companyKey/notifications",
    title: "Notifications",
    description: "Review account and company notifications.",
  },
];

export function resolveRouteMetadata(pathname: string): ResolvedMetadata {
  const match = routes.find((item) => matchPath({ path: item.path, end: true }, pathname));
  const pageTitle = match?.title ?? "Page not found";
  return {
    title: `${pageTitle} | ${appConfig.name}`,
    description: match?.description ?? appConfig.description,
    robots: "noindex, nofollow, noarchive",
  };
}
