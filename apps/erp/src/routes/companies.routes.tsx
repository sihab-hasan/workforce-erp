import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import CompaniesPage from "#pages/companies/CompaniesPage";
import CompanyCreatePage from "#pages/companies/CompanyCreatePage";
import CompanyDetailsPage from "#pages/companies/CompanyDetailsPage";
import CompanyEditPage from "#pages/companies/CompanyEditPage";

export const companiesRoutes: RouteObject[] = [
  {
    path: "companies",
    element: (
      <AuthorizedRoute capability="company.manage">
        <CompaniesPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "companies/new",
    element: (
      <AuthorizedRoute capability="company.manage">
        <CompanyCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "companies/:companyId",
    element: (
      <AuthorizedRoute capability="company.manage">
        <CompanyDetailsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "companies/:companyId/edit",
    element: (
      <AuthorizedRoute capability="company.manage">
        <CompanyEditPage />
      </AuthorizedRoute>
    ),
  },
];
