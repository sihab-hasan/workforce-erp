import type { ComponentType } from "react"
import {
  AlertTriangle,
  Building2,
  Clock3,
  FileText,
  Home,
  KeyRound,
  LayoutGrid,
  Receipt,
  ShieldAlert,
  Users,
} from "lucide-react"
import ForgotPasswordPage from "@/modules/core/authentication/pages/ForgotPasswordPage.tsx"
import LoginPage from "@/modules/core/authentication/pages/LoginPage.tsx"
import MfaChallengePage from "@/modules/core/authentication/pages/MfaChallengePage.tsx"
import ResetPasswordPage from "@/modules/core/authentication/pages/ResetPasswordPage.tsx"
import SsoCallbackPage from "@/modules/core/authentication/pages/SsoCallbackPage.tsx"
import DashboardPage from "@/modules/core/dashboard/pages/DashboardPage.tsx"
import ForbiddenPage from "@/app/pages/ForbiddenPage.tsx"
import MaintenancePage from "@/app/pages/MaintenancePage.tsx"
import NotFoundPage from "@/app/pages/NotFoundPage.tsx"
import ServerErrorPage from "@/app/pages/ServerErrorPage.tsx"
import DepartmentListPage from "@/modules/people/departments/pages/DepartmentListPage.tsx"
import EmployeeDocumentListPage from "@/modules/people/employee-documents/pages/EmployeeDocumentListPage.tsx"
import EmployeeDirectoryPage from "@/modules/people/employees/pages/EmployeeDirectoryPage.tsx"
import LeaveRequestListPage from "@/modules/people/leave/pages/LeaveRequestListPage.tsx"
import PayrollRunsPage from "@/modules/people/payroll/pages/PayrollRunsPage.tsx"
import CandidateListPage from "@/modules/people/recruitment/pages/CandidateListPage.tsx"
import TimesheetListPage from "@/modules/people/timesheet/pages/TimesheetListPage.tsx"
import UserListPage from "@/modules/core/users/pages/UserListPage.tsx"
import AccountSecurityPage from "@/modules/core/profile/pages/AccountSecurityPage.tsx"
import SessionsPage from "@/modules/core/profile/pages/SessionsPage.tsx"

type Icon = ComponentType<{ className?: string }>

export type PortalRoute = {
  key: string
  title: string
  description: string
  path: string
  section: string
  icon: Icon
  component: ComponentType
  /** Show this route in the primary sidebar/mobile navigation. */
  navigation?: boolean
  /** Optional coarse-grained role gate for portal navigation/routes. */
  allowedRoles?: string[]
  /** When true, the route renders without the portal shell layout */
  isAuthRoute?: boolean
  /** Public recovery routes can remain available during an existing session. */
  anonymousOnly?: boolean
}

export const portalRoutes: PortalRoute[] = [
  {
    key: "overview",
    title: "Overview",
    description: "Command center for the workforce platform",
    path: "/",
    section: "Workspace",
    icon: Home,
    component: DashboardPage,
  },
  {
    key: "employees",
    title: "Employees",
    description: "Directory, profiles, and people operations",
    path: "/people/employees",
    section: "Workforce",
    icon: Users,
    component: EmployeeDirectoryPage,
  },
  {
    key: "departments",
    title: "Departments",
    description: "Org units, hierarchy, and ownership",
    path: "/people/departments",
    section: "Workforce",
    icon: Building2,
    component: DepartmentListPage,
  },
  {
    key: "leave",
    title: "Leave",
    description: "Requests, balances, and approvals",
    path: "/people/leave",
    section: "Workforce",
    icon: LayoutGrid,
    component: LeaveRequestListPage,
  },
  {
    key: "documents",
    title: "Documents",
    description: "Templates, requests, and expirations",
    path: "/people/documents",
    section: "Workforce",
    icon: FileText,
    component: EmployeeDocumentListPage,
  },
  {
    key: "recruitment",
    title: "Recruitment",
    description: "Candidate pipelines and hiring workflow",
    path: "/people/recruitment",
    section: "People",
    icon: Users,
    component: CandidateListPage,
    navigation: false,
  },
  {
    key: "timesheet",
    title: "Timesheet",
    description: "Track hours, timesheets, and schedules",
    path: "/people/timesheet",
    section: "Time & Pay",
    icon: Clock3,
    component: TimesheetListPage,
  },
  {
    key: "payroll",
    title: "Payroll",
    description: "Runs, reports, and salary operations",
    path: "/people/payroll",
    section: "Time & Pay",
    icon: Receipt,
    component: PayrollRunsPage,
  },
  {
    key: "users",
    title: "Users & Access",
    description: "Invite users, manage roles, status, and employee links",
    path: "/core/users",
    section: "Administration",
    icon: Users,
    component: UserListPage,
    allowedRoles: ["owner", "admin"],
  },
  {
    key: "account-security",
    title: "Security",
    description: "Change your password and protect account access",
    path: "/profile/security",
    section: "Account",
    icon: KeyRound,
    component: AccountSecurityPage,
  },
  {
    key: "sessions",
    title: "Active Sessions",
    description: "Review and revoke active API sessions",
    path: "/profile/sessions",
    section: "Account",
    icon: ShieldAlert,
    component: SessionsPage,
  },
  {
    key: "maintenance",
    title: "Maintenance",
    description: "Platform status and maintenance mode",
    path: "/system/maintenance",
    section: "System",
    icon: AlertTriangle,
    component: MaintenancePage,
    navigation: false,
  },
  {
    key: "forbidden",
    title: "Forbidden",
    description: "Permission boundary preview state",
    path: "/system/forbidden",
    section: "System",
    icon: ShieldAlert,
    component: ForbiddenPage,
    navigation: false,
  },
  {
    key: "server-error",
    title: "Server Error",
    description: "Failure screen for backend incidents",
    path: "/system/server-error",
    section: "System",
    icon: AlertTriangle,
    component: ServerErrorPage,
    navigation: false,
  },
]

export const defaultPortalRoute = portalRoutes[0]

export const fallbackPortalRoute: PortalRoute = {
  key: "not-found",
  title: "Not Found",
  description: "The requested view could not be located",
  path: "/404",
  section: "System",
  icon: AlertTriangle,
  component: NotFoundPage,
}

/** Auth routes render fullscreen — no sidebar or portal shell. */
export const authRoutes: PortalRoute[] = [
  {
    key: "login",
    title: "Sign In",
    description: "Authenticate to access the portal",
    path: "/auth/login",
    section: "Auth",
    icon: KeyRound,
    component: LoginPage,
    isAuthRoute: true,
  },
  {
    key: "forgot-password",
    title: "Forgot Password",
    description: "Request a secure password reset link",
    path: "/auth/forgot-password",
    section: "Auth",
    icon: KeyRound,
    component: ForgotPasswordPage,
    isAuthRoute: true,
    anonymousOnly: false,
  },
  {
    key: "reset-password",
    title: "Reset Password",
    description: "Set a new password using a secure reset token",
    path: "/auth/reset-password",
    section: "Auth",
    icon: KeyRound,
    component: ResetPasswordPage,
    isAuthRoute: true,
    anonymousOnly: false,
  },
  {
    key: "mfa",
    title: "One-Time Code",
    description: "Sign in using an email verification code",
    path: "/auth/mfa",
    section: "Auth",
    icon: KeyRound,
    component: MfaChallengePage,
    isAuthRoute: true,
  },
  {
    key: "sso-callback",
    title: "Single Sign-On",
    description: "Complete Google or Microsoft authentication",
    path: "/auth/callback/:provider",
    section: "Auth",
    icon: KeyRound,
    component: SsoCallbackPage,
    isAuthRoute: true,
  },
]
