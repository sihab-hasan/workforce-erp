import { matchPath } from "react-router-dom";
import { appConfig } from "#config/app";

interface RouteMetadataDefinition {
  path: string;
  title: string;
  description: string;
  robots?: string;
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  robots: string;
  canonical: string;
}

const routes: RouteMetadataDefinition[] = [
  {
    path: "/",
    title: "Workforce ERP | Modern Workforce Management",
    description:
      "Manage employees, departments, leave, timesheets, documents, approvals, and workforce reporting from one modern ERP workspace.",
  },
  {
    path: "/features",
    title: "Features | Workforce ERP",
    description:
      "Explore Workforce ERP features for employee management, leave, timesheets, documents, approvals, reporting, and organizational workflows.",
  },
  {
    path: "/about",
    title: "About | Workforce ERP",
    description:
      "Learn about Workforce ERP and our approach to simpler, connected workforce operations for modern organizations.",
  },
  {
    path: "/contact",
    title: "Contact | Workforce ERP",
    description:
      "Contact the Workforce ERP team for product, implementation, and support information.",
  },
  {
    path: "/sign-in",
    title: "Sign in | Workforce ERP",
    description: "Sign in to your Workforce ERP organization workspace.",
    robots: "noindex, nofollow, noarchive",
  },
  {
    path: "/sign-in",
    title: "Sign in | Workforce ERP",
    description: "Sign in to your Workforce ERP organization workspace.",
    robots: "noindex, nofollow, noarchive",
  },
];

function canonicalUrl(pathname: string) {
  const configuredOrigin = import.meta.env.VITE_WEB_URL?.trim().replace(/\/+$/, "");
  const origin = configuredOrigin || window.location.origin;
  return `${origin}${pathname === "/" ? "" : pathname}`;
}

export function resolveRouteMetadata(pathname: string): ResolvedMetadata {
  const match = routes.find((item) => matchPath({ path: item.path, end: true }, pathname));
  return {
    title: match?.title ?? `Page not found | ${appConfig.name}`,
    description: match?.description ?? appConfig.description,
    robots: match?.robots ?? (match ? "index, follow" : "noindex, follow"),
    canonical: canonicalUrl(pathname),
  };
}
