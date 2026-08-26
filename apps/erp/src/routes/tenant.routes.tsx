import { Navigate, type RouteObject, useParams } from "react-router-dom";
import { TenantLayout } from "#layouts/TenantLayout";
import { RootLayout } from "#layouts/RootLayout";
import TenantSelectPage from "#pages/tenant/TenantSelectPage";
import TenantSwitchPage from "#pages/tenant/TenantSwitchPage";
import CompanySelectPage from "#pages/company/CompanySelectPage";
import CompanySwitchPage from "#pages/company/CompanySwitchPage";
import { ProtectedRoute } from "#features/authentication/route-guards";
import { organizationRoutes } from "#routes/organization.routes";
import { companiesRoutes } from "#routes/companies.routes";
import { usersRoutes } from "#routes/users.routes";
import { settingsRoutes } from "#routes/settings.routes";
import { ERP_PATHS, tenantRoutes as paths } from "#routes/paths";
import { RouteNotFound } from "#components/feedback";

function TenantNotFound() {
  const { tenantKey } = useParams();
  return (
    <RouteNotFound homeTo={tenantKey ? paths.selectCompany(tenantKey) : ERP_PATHS.tenantSelect} />
  );
}

export const tenantRoutes: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "select-tenant", element: <TenantSelectPage /> },
      { path: "switch-tenant", element: <TenantSwitchPage /> },
    ],
  },
  {
    path: "t/:tenantKey/switch",
    element: <Navigate to={ERP_PATHS.tenantSwitch} replace />,
  },
  {
    path: "t/:tenantKey",
    element: (
      <ProtectedRoute>
        <TenantLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="select-company" replace /> },
      { path: "select-company", element: <CompanySelectPage /> },
      { path: "switch-company", element: <CompanySwitchPage /> },
      ...organizationRoutes,
      ...companiesRoutes,
      ...usersRoutes,
      ...settingsRoutes,
      { path: "*", element: <TenantNotFound /> },
    ],
  },
];
