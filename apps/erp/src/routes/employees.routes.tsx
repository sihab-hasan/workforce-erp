import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import EmployeesPage from "#pages/employees/EmployeesPage";
import EmployeeCreatePage from "#pages/employees/EmployeeCreatePage";
import EmployeeDetailsPage from "#pages/employees/EmployeeDetailsPage";
import EmployeeEditPage from "#pages/employees/EmployeeEditPage";

export const employeesRoutes: RouteObject[] = [
  {
    path: "employees",
    element: (
      <AuthorizedRoute capability="employee.read">
        <EmployeesPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "employees/new",
    element: (
      <AuthorizedRoute capability="employee.manage">
        <EmployeeCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "employees/:employeeId",
    element: (
      <AuthorizedRoute capability="employee.read">
        <EmployeeDetailsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "employees/:employeeId/edit",
    element: (
      <AuthorizedRoute capability="employee.manage">
        <EmployeeEditPage />
      </AuthorizedRoute>
    ),
  },
];
