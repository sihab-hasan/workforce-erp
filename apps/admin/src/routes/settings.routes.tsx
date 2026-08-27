import type { RouteObject } from "react-router-dom";
import SettingsPage from "#pages/settings/SettingsPage";
export const settingsRoutes: RouteObject[] = [{ path: "settings", element: <SettingsPage /> }];
