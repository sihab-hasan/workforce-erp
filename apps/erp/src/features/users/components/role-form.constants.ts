import {
  BarChart3,
  Building,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Layers,
  Lock,
  Shield,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoleRecord = {
  id: string;
  name: string;
  description?: string | null;
  employees_count?: number;
  permissions: string[];
};

export type PermissionOption = {
  id: string;
  name: string;
  description?: string | null;
};

export type RolePayload = {
  name: string;
  description: string;
  permissions: string[];
};

// ─── Permission Meta ──────────────────────────────────────────────────────────

export const PERMISSION_FRIENDLY_META: Record<
  string,
  { label: string; description: string; module: string }
> = {
  // Employee
  "employee.view": {
    label: "View Employee Directory",
    description: "Browse all employee profiles and public contact details",
    module: "employee",
  },
  "employee.read": {
    label: "Read Employee Details",
    description: "Access detailed employee work records and profile data",
    module: "employee",
  },
  "employee.manage": {
    label: "Manage Employees",
    description: "Create, edit, onboard, and offboard employee profiles",
    module: "employee",
  },

  // Leave
  "leave.view": {
    label: "View Leave Requests",
    description: "View personal and team leave history and status",
    module: "leave",
  },
  "leave.manage": {
    label: "Submit & Manage Leave",
    description: "Apply for leaves and manage pending leave applications",
    module: "leave",
  },
  "leave.approve": {
    label: "Approve Leave Requests",
    description: "Approve or decline employee leave applications",
    module: "leave",
  },

  // Timesheet
  "timesheet.view": {
    label: "View Timesheets",
    description: "Inspect work logs, clock-in records, and shift hours",
    module: "timesheet",
  },
  "timesheet.manage": {
    label: "Manage & Log Timesheets",
    description: "Submit daily timesheets and adjust attendance entries",
    module: "timesheet",
  },

  // Approval
  "approval.view": {
    label: "View Approval Requests",
    description: "Inspect pending requests requiring review or decision",
    module: "approval",
  },
  "approval.approve": {
    label: "Approve Workflow Requests",
    description: "Grant final sign-off or reject submitted approval workflows",
    module: "approval",
  },

  // Department
  "department.view": {
    label: "View Departments",
    description: "Browse department listings and team member rosters",
    module: "department",
  },
  "department.manage": {
    label: "Manage Departments",
    description: "Create, rename, or restructure company departments",
    module: "department",
  },

  // Document
  "document.view": {
    label: "View Documents",
    description: "Preview and download uploaded organization documents",
    module: "document",
  },
  "document.manage": {
    label: "Manage Documents",
    description: "Upload, categorize, update, and delete company files",
    module: "document",
  },

  // Organization & Company
  "organization.view": {
    label: "View Organization Details",
    description: "View general organization overview and profile",
    module: "organization",
  },
  "organization.manage": {
    label: "Manage Organization",
    description: "Update organization settings, branding, and policies",
    module: "organization",
  },
  "organization.owner.assign": {
    label: "Transfer Ownership",
    description: "Reassign the primary organization owner account",
    module: "organization",
  },
  "company.view": {
    label: "View Company Entities",
    description: "Browse company branches and operational entities",
    module: "company",
  },
  "company.manage": {
    label: "Manage Company Entities",
    description: "Add, configure, or modify company entities and branches",
    module: "company",
  },
  "domain.manage": {
    label: "Manage Custom Domains",
    description: "Verify and configure corporate email and web domains",
    module: "organization",
  },
  "subscription.view": {
    label: "View Subscriptions",
    description: "Check billing status, plan quotas, and feature tiers",
    module: "organization",
  },

  // Users & Roles
  "user.view": {
    label: "View User Accounts",
    description: "See list of registered users and their account status",
    module: "user",
  },
  "user.invite": {
    label: "Invite New Users",
    description: "Send email invitations to join the organization",
    module: "user",
  },
  "user.manage": {
    label: "Manage User Accounts",
    description: "Modify user access, disable accounts, and change settings",
    module: "user",
  },
  "role.view": {
    label: "View Roles",
    description: "Inspect assigned roles and permission configurations",
    module: "role",
  },
  "role.manage": {
    label: "Manage Custom Roles",
    description: "Create, edit, and configure custom security roles",
    module: "role",
  },
  "role.assign": {
    label: "Assign Roles to Members",
    description: "Grant or revoke security roles on user accounts",
    module: "role",
  },

  // Security & Compliance
  "security.manage": {
    label: "Manage Security Policies",
    description: "Configure MFA requirements and enterprise security rules",
    module: "security",
  },
  "session.manage": {
    label: "Manage Active Sessions",
    description: "Review and revoke active login sessions across devices",
    module: "security",
  },
  "access_request.create": {
    label: "Request Elevated Access",
    description: "Submit requests for temporary higher privilege access",
    module: "security",
  },
  "access_request.approve": {
    label: "Approve Access Requests",
    description: "Grant temporary privilege elevations to team members",
    module: "security",
  },
  "service_account.manage": {
    label: "Manage API Service Accounts",
    description: "Create and rotate service tokens for integrations",
    module: "security",
  },
  "audit.view": {
    label: "View Audit Logs",
    description: "Access comprehensive compliance and security audit logs",
    module: "audit",
  },
  "impersonation.start": {
    label: "Start Support Impersonation",
    description: "Temporarily sign in as another user for troubleshooting",
    module: "security",
  },
  "break_glass.start": {
    label: "Emergency Break-Glass",
    description: "Trigger emergency override access with audit tracking",
    module: "security",
  },
  "onboarding.manage": {
    label: "Manage Onboarding",
    description: "Configure employee onboarding checklists and flows",
    module: "security",
  },

  // Reports
  "report.view": {
    label: "View Reports",
    description: "Access business reports, trends, and summary metrics",
    module: "report",
  },
  "report.export": {
    label: "Export Report Data",
    description: "Download CSV, Excel, or PDF report datasets",
    module: "report",
  },

  // Finance & Payroll
  "payroll.prepare": {
    label: "Prepare Payroll",
    description: "Calculate hours, salary adjustments, and payroll drafts",
    module: "payroll",
  },
  "payroll.approve": {
    label: "Approve Payroll",
    description: "Review and grant authorization for payroll payouts",
    module: "payroll",
  },
  "payment.approve": {
    label: "Authorize Payments",
    description: "Approve outgoing corporate payment transactions",
    module: "finance",
  },
  "vendor.create": {
    label: "Create Vendors",
    description: "Register new supplier and vendor profiles",
    module: "finance",
  },
  "vendor.approve": {
    label: "Approve Vendors",
    description: "Validate and approve supplier agreements",
    module: "finance",
  },
  "purchase.create": {
    label: "Create Purchase Orders",
    description: "Draft procurement orders and purchase requests",
    module: "finance",
  },
  "purchase.approve": {
    label: "Approve Purchase Orders",
    description: "Authorize purchase requisitions and spend limits",
    module: "finance",
  },
  "journal.create": {
    label: "Draft Journal Entries",
    description: "Record general ledger and accounting entries",
    module: "finance",
  },
  "journal.post": {
    label: "Post Journal Entries",
    description: "Finalize and lock accounting ledger transactions",
    module: "finance",
  },
  "refund.create": {
    label: "Issue Refunds",
    description: "Initiate customer return or credit refund requests",
    module: "finance",
  },
  "refund.approve": {
    label: "Approve Refunds",
    description: "Authorize outgoing refund transactions",
    module: "finance",
  },

  // Notifications
  "notification.view": {
    label: "View Notifications",
    description: "Receive and browse organizational alert streams",
    module: "notification",
  },
  "settings.view": {
    label: "View Settings",
    description: "Access company preference configurations",
    module: "organization",
  },
  "settings.manage": {
    label: "Manage Settings",
    description: "Modify global preferences and workspace defaults",
    module: "organization",
  },
};

// ─── Module Definitions ───────────────────────────────────────────────────────

export const MODULE_DEFINITIONS: Record<
  string,
  { title: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  employee: {
    title: "Employee Management",
    icon: Users,
    description: "Staff directories, work profiles, and team assignments",
  },
  leave: {
    title: "Leave & Time Off",
    icon: Calendar,
    description: "Leave submissions, day allocations, and manager approvals",
  },
  timesheet: {
    title: "Timesheets & Attendance",
    icon: Clock,
    description: "Work hour tracking, clock-in logs, and shift approvals",
  },
  approval: {
    title: "Approvals & Workflows",
    icon: CheckSquare,
    description: "Workflow requests, authorizations, and signing steps",
  },
  department: {
    title: "Departments & Teams",
    icon: Layers,
    description: "Department structures, hierarchies, and divisions",
  },
  document: {
    title: "Documents & Files",
    icon: FileText,
    description: "Company document repository and employee records",
  },
  organization: {
    title: "Organization & Settings",
    icon: Building2,
    description: "Organizational branding, domains, and global policies",
  },
  company: {
    title: "Company Entities",
    icon: Building,
    description: "Legal entities, subsidiaries, and localized branches",
  },
  user: {
    title: "User Accounts",
    icon: Users,
    description: "User invitations, account statuses, and credentials",
  },
  role: {
    title: "Roles & Permissions",
    icon: Shield,
    description: "Role definitions and custom authorization grants",
  },
  security: {
    title: "Security & Governance",
    icon: Lock,
    description: "MFA rules, elevated access, sessions, and compliance",
  },
  audit: {
    title: "Audit & Logs",
    icon: FileText,
    description: "Compliance trails and system audit event logs",
  },
  report: {
    title: "Reports & Analytics",
    icon: BarChart3,
    description: "Workforce dashboards, time exports, and analytics",
  },
  payroll: {
    title: "Payroll Operations",
    icon: DollarSign,
    description: "Payroll batch preparation and salary disbursements",
  },
  finance: {
    title: "Finance & Purchasing",
    icon: DollarSign,
    description: "Purchases, vendor contracts, journal entries, and refunds",
  },
  notification: {
    title: "Notifications",
    icon: Shield,
    description: "System notifications and team broadcasts",
  },
  other: {
    title: "General Permissions",
    icon: Shield,
    description: "Additional platform access and capabilities",
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getPermissionPresentation(
  permissionName: string,
  fallbackDescription?: string | null,
) {
  const known = PERMISSION_FRIENDLY_META[permissionName];
  if (known) return known;

  const parts = permissionName.split(".");
  const moduleKey = parts[0]?.toLowerCase() ?? "other";
  const actionKey = parts.slice(1).join(" ") || parts[0] || permissionName;

  const humanAction = actionKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const humanModule = moduleKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const label = humanAction.toLowerCase().includes(humanModule.toLowerCase())
    ? humanAction
    : `${humanAction} ${humanModule}`;

  const description =
    fallbackDescription && fallbackDescription !== permissionName
      ? fallbackDescription
      : `Grants capability to ${humanAction.toLowerCase()} in ${humanModule}.`;

  return {
    label,
    description,
    module: MODULE_DEFINITIONS[moduleKey] ? moduleKey : "other",
  };
}
