import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import ReportsPage from "#pages/reports/ReportsPage";
import EmployeeReportPage from "#pages/reports/EmployeeReportPage";
import LeaveReportPage from "#pages/reports/LeaveReportPage";
import TimesheetReportPage from "#pages/reports/TimesheetReportPage";
import DepartmentReportPage from "#pages/reports/DepartmentReportPage";

export const reportsRoutes: RouteObject[] = [
  {
    path: "reports",
    element: (
      <AuthorizedRoute capability="report.view">
        <ReportsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "reports/employees",
    element: (
      <AuthorizedRoute capability="report.view">
        <EmployeeReportPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "reports/leave",
    element: (
      <AuthorizedRoute capability="report.view">
        <LeaveReportPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "reports/timesheets",
    element: (
      <AuthorizedRoute capability="report.view">
        <TimesheetReportPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "reports/departments",
    element: (
      <AuthorizedRoute capability="report.view">
        <DepartmentReportPage />
      </AuthorizedRoute>
    ),
  },
];
