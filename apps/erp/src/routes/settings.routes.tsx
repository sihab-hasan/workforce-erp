import type { RouteObject } from "react-router-dom";
import { AuthorizedRoute } from "#features/authentication/route-guards";
import SettingsPage from "#pages/settings/SettingsPage";
import ProfileSettingsPage from "#pages/settings/ProfileSettingsPage";
import OrganizationSettingsPage from "#pages/settings/OrganizationSettingsPage";
import AccountSecurityPage from "#features/authentication/profile/pages/AccountSecurityPage";
import SessionsPage from "#features/authentication/profile/pages/SessionsPage";
import DevicesPage from "#features/authentication/profile/pages/DevicesPage";

export const settingsRoutes: RouteObject[] = [
  { path: "settings", element: <SettingsPage /> },
  { path: "settings/profile", element: <ProfileSettingsPage /> },
  { path: "settings/security", element: <AccountSecurityPage /> },
  { path: "settings/sessions", element: <SessionsPage /> },
  { path: "settings/devices", element: <DevicesPage /> },
  {
    path: "settings/organization",
    element: (
      <AuthorizedRoute capability="settings.manage">
        <OrganizationSettingsPage />
      </AuthorizedRoute>
    ),
  },
];
