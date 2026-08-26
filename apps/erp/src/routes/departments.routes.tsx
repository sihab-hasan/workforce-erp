import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import DepartmentsPage from "#pages/departments/DepartmentsPage";
import DepartmentCreatePage from "#pages/departments/DepartmentCreatePage";
import DepartmentDetailsPage from "#pages/departments/DepartmentDetailsPage";
import DepartmentEditPage from "#pages/departments/DepartmentEditPage";

export const departmentsRoutes: RouteObject[] = [
  {
    path: "departments",
    element: (
      <AuthorizedRoute capability="department.manage">
        <DepartmentsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "departments/new",
    element: (
      <AuthorizedRoute capability="department.manage">
        <DepartmentCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "departments/:departmentId",
    element: (
      <AuthorizedRoute capability="department.manage">
        <DepartmentDetailsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "departments/:departmentId/edit",
    element: (
      <AuthorizedRoute capability="department.manage">
        <DepartmentEditPage />
      </AuthorizedRoute>
    ),
  },
];
