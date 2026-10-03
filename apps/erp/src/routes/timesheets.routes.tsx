import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import TimesheetsPage from "#pages/timesheets/TimesheetsPage";
import TimesheetCreatePage from "#pages/timesheets/TimesheetCreatePage";
import TimesheetDetailsPage from "#pages/timesheets/TimesheetDetailsPage";
import TimesheetEditPage from "#pages/timesheets/TimesheetEditPage";

export const timesheetsRoutes: RouteObject[] = [
  {
    path: "timesheets",
    element: (
      <AuthorizedRoute capability="timesheet.view">
        <TimesheetsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "timesheets/new",
    element: (
      <AuthorizedRoute capability="timesheet.manage">
        <TimesheetCreatePage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "timesheets/:timesheetId",
    element: (
      <AuthorizedRoute capability="timesheet.view">
        <TimesheetDetailsPage />
      </AuthorizedRoute>
    ),
  },
  {
    path: "timesheets/:timesheetId/edit",
    element: (
      <AuthorizedRoute capability="timesheet.manage">
        <TimesheetEditPage />
      </AuthorizedRoute>
    ),
  },
];
