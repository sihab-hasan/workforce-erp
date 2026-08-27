import { matchPath } from "react-router-dom";
import { appConfig } from "#config/app";

interface RouteMetadataDefinition {
  path: string;
  title: string;
  description: string;
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  robots: string;
}

const routes: RouteMetadataDefinition[] = [
  {
    path: "/auth/sign-in",
    title: "Admin sign in",
    description: "Sign in securely to Workforce ERP platform administration.",
  },
  {
    path: "/auth/login",
    title: "Admin sign in",
    description: "Sign in securely to Workforce ERP platform administration.",
  },
  {
    path: "/admin/dashboard",
    title: "Dashboard",
    description: "Platform administration overview for tenants, organizations, users, and access.",
  },
  {
    path: "/admin/tenants/new",
    title: "Create tenant",
    description: "Provision a new Workforce ERP tenant workspace.",
  },
  {
    path: "/admin/tenants/:tenantId/edit",
    title: "Edit tenant",
    description: "Update tenant workspace configuration.",
  },
  {
    path: "/admin/tenants/:tenantId",
    title: "Tenant details",
    description: "Review tenant workspace information and status.",
  },
  {
    path: "/admin/tenants",
    title: "Tenants",
    description: "Manage Workforce ERP tenant workspaces.",
  },
  {
    path: "/admin/organizations/:organizationId/edit",
    title: "Edit organization",
    description: "Update platform organization information.",
  },
  {
    path: "/admin/organizations/:organizationId",
    title: "Organization details",
    description: "Review organization information and platform relationships.",
  },
  {
    path: "/admin/organizations",
    title: "Organizations",
    description: "Manage organizations across Workforce ERP.",
  },
  {
    path: "/admin/users/new",
    title: "Create user",
    description: "Create a platform user account.",
  },
  {
    path: "/admin/users/:userId/edit",
    title: "Edit user",
    description: "Update platform user information and access.",
  },
  {
    path: "/admin/users/:userId",
    title: "User details",
    description: "Review platform user information, roles, and access.",
  },
  { path: "/admin/users", title: "Users", description: "Manage platform users and access." },
  {
    path: "/admin/roles/capabilities",
    title: "Capability matrix",
    description: "Review and manage role capability assignments.",
  },
  {
    path: "/admin/roles/:roleId",
    title: "Role details",
    description: "Review role permissions and capability assignments.",
  },
  {
    path: "/admin/roles",
    title: "Roles",
    description: "Manage platform roles and access capabilities.",
  },
  {
    path: "/admin/settings",
    title: "Settings",
    description: "Manage Workforce ERP platform administration settings.",
  },
];

export function resolveRouteMetadata(pathname: string): ResolvedMetadata {
  const match = routes.find((item) => matchPath({ path: item.path, end: true }, pathname));
  const pageTitle = match?.title ?? "Admin page not found";
  return {
    title: `${pageTitle} | ${appConfig.name}`,
    description: match?.description ?? appConfig.description,
    robots: "noindex, nofollow, noarchive",
  };
}
