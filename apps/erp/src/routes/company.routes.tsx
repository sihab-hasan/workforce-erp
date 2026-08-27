import { Navigate, type RouteObject, useParams } from "react-router-dom";
import { CompanyLayout } from "#layouts/CompanyLayout";
import { ProtectedRoute } from "#features/authentication/route-guards";
import { dashboardRoutes } from "#routes/dashboard.routes";
import { departmentsRoutes } from "#routes/departments.routes";
import { employeesRoutes } from "#routes/employees.routes";
import { leaveRoutes } from "#routes/leave.routes";
import { timesheetsRoutes } from "#routes/timesheets.routes";
import { approvalsRoutes } from "#routes/approvals.routes";
import { documentsRoutes } from "#routes/documents.routes";
import { reportsRoutes } from "#routes/reports.routes";
import { notificationsRoutes } from "#routes/notifications.routes";
import { RouteNotFound } from "#components/feedback";
import { companyRoutes as paths, ERP_PATHS, tenantRoutes } from "#routes/paths";

function CompanySwitchRedirect() {
  const { tenantKey } = useParams();
  return (
    <Navigate
      to={tenantKey ? tenantRoutes.switchCompany(tenantKey) : ERP_PATHS.tenantSelect}
      replace
    />
  );
}

function CompanyNotFound() {
  const { tenantKey, companyKey } = useParams();
  const homeTo =
    tenantKey && companyKey ? paths.dashboard(tenantKey, companyKey) : ERP_PATHS.tenantSelect;
  return <RouteNotFound homeTo={homeTo} />;
}

export const companyRoutes: RouteObject[] = [
  {
    path: "t/:tenantKey/c/:companyKey",
    element: (
      <ProtectedRoute>
        <CompanyLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "switch", element: <CompanySwitchRedirect /> },
      ...dashboardRoutes,
      ...departmentsRoutes,
      ...employeesRoutes,
      ...leaveRoutes,
      ...timesheetsRoutes,
      ...approvalsRoutes,
      ...documentsRoutes,
      ...reportsRoutes,
      ...notificationsRoutes,
      { path: "*", element: <CompanyNotFound /> },
    ],
  },
];
