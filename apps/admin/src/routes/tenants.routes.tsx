import type { RouteObject } from "react-router-dom";
import TenantsPage from "#pages/tenants/TenantsPage";
import TenantCreatePage from "#pages/tenants/TenantCreatePage";
import TenantDetailsPage from "#pages/tenants/TenantDetailsPage";
import TenantEditPage from "#pages/tenants/TenantEditPage";
export const tenantRoutes: RouteObject[] = [
  { path: "tenants", element: <TenantsPage /> },
  { path: "tenants/new", element: <TenantCreatePage /> },
  { path: "tenants/:tenantId", element: <TenantDetailsPage /> },
  { path: "tenants/:tenantId/edit", element: <TenantEditPage /> },
];
