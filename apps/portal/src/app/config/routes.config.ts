import type { ComponentType } from "react"
import {
  AlertTriangle,
  Building2,
  Clock3,
  FileText,
  Home,
  LayoutGrid,
  Receipt,
  ShieldAlert,
  Users,
} from "lucide-react"
import ForbiddenPage from "@/app/pages/ForbiddenPage.tsx"
import MaintenancePage from "@/app/pages/MaintenancePage.tsx"
import NotFoundPage from "@/app/pages/NotFoundPage.tsx"
import ServerErrorPage from "@/app/pages/ServerErrorPage.tsx"
import AttendanceTodayPage from "@/modules/people/attendance/pages/AttendanceTodayPage.tsx"
import DepartmentListPage from "@/modules/people/departments/pages/DepartmentListPage.tsx"
import EmployeeDocumentListPage from "@/modules/people/employee-documents/pages/EmployeeDocumentListPage.tsx"
import EmployeeDirectoryPage from "@/modules/people/employees/pages/EmployeeDirectoryPage.tsx"
import LeaveRequestListPage from "@/modules/people/leave/pages/LeaveRequestListPage.tsx"
import PayrollRunsPage from "@/modules/people/payroll/pages/PayrollRunsPage.tsx"
import CandidateListPage from "@/modules/people/recruitment/pages/CandidateListPage.tsx"
import ShiftRosterPage from "@/modules/people/shifts/pages/ShiftRosterPage.tsx"

type Icon = ComponentType<{ className?: string }>

export type PortalRoute = {
  key: string
  title: string
  description: string
  path: string
  section: string
  icon: Icon
  component: ComponentType
}

export const portalRoutes: PortalRoute[] = [
  {
    key: "overview",
    title: "Overview",
    description: "Command center for the workforce platform",
    path: "/",
    section: "Workspace",
    icon: Home,
    component: AttendanceTodayPage,
  },
  {
    key: "employees",
    title: "Employees",
    description: "Directory, profiles, and people operations",
    path: "/people/employees",
    section: "People",
    icon: Users,
    component: EmployeeDirectoryPage,
  },
  {
    key: "departments",
    title: "Departments",
    description: "Org units, hierarchy, and ownership",
    path: "/people/departments",
    section: "People",
    icon: Building2,
    component: DepartmentListPage,
  },
  {
    key: "attendance",
    title: "Attendance",
    description: "Daily activity, presence, and reporting",
    path: "/people/attendance",
    section: "People",
    icon: Clock3,
    component: AttendanceTodayPage,
  },
  {
    key: "leave",
    title: "Leave",
    description: "Requests, balances, and approvals",
    path: "/people/leave",
    section: "People",
    icon: LayoutGrid,
    component: LeaveRequestListPage,
  },
  {
    key: "documents",
    title: "Documents",
    description: "Templates, requests, and expirations",
    path: "/people/documents",
    section: "People",
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
  },
  {
    key: "shifts",
    title: "Shifts",
    description: "Rosters, assignments, and schedules",
    path: "/people/shifts",
    section: "People",
    icon: Clock3,
    component: ShiftRosterPage,
  },
  {
    key: "payroll",
    title: "Payroll",
    description: "Runs, reports, and salary operations",
    path: "/people/payroll",
    section: "Finance",
    icon: Receipt,
    component: PayrollRunsPage,
  },
  {
    key: "maintenance",
    title: "Maintenance",
    description: "Platform status and maintenance mode",
    path: "/system/maintenance",
    section: "System",
    icon: AlertTriangle,
    component: MaintenancePage,
  },
  {
    key: "forbidden",
    title: "Forbidden",
    description: "Permission boundary preview state",
    path: "/system/forbidden",
    section: "System",
    icon: ShieldAlert,
    component: ForbiddenPage,
  },
  {
    key: "server-error",
    title: "Server Error",
    description: "Failure screen for backend incidents",
    path: "/system/server-error",
    section: "System",
    icon: AlertTriangle,
    component: ServerErrorPage,
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
