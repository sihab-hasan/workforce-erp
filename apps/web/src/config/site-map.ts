import type { NavigationDropdownItem, NavigationItem } from "#components/shared/navigation";
import { WEB_PATHS } from "#routes/paths";

export type SiteNavigationItem = NavigationItem & {
  items?: NavigationDropdownItem[];
};

export type SiteRouteDefinition = {
  key: string;
  label: string;
  path: string;
};

/**
 * Mini-site route catalogue.
 * Only real mini pages are canonical. Big-site concepts that are still used by
 * transferred components intentionally resolve to the nearest existing mini page.
 */
export const siteRoutes = {
  home: { key: "home", label: "Home", path: WEB_PATHS.home },
  features: { key: "features", label: "Features", path: WEB_PATHS.features },
  integrations: { key: "integrations", label: "Integrations", path: WEB_PATHS.features },
  about: { key: "about", label: "About", path: WEB_PATHS.about },
  contact: { key: "contact", label: "Contact", path: WEB_PATHS.contact },
  demoRequest: { key: "demoRequest", label: "Request Demo", path: WEB_PATHS.contact },
} satisfies Record<string, SiteRouteDefinition>;

export const primaryNavigationItems: NavigationItem[] = [
  { label: siteRoutes.features.label, to: siteRoutes.features.path },
  { label: siteRoutes.about.label, to: siteRoutes.about.path },
  { label: siteRoutes.contact.label, to: siteRoutes.contact.path },
];

export const productNavigationItems: NavigationDropdownItem[] = [
  {
    label: siteRoutes.features.label,
    to: siteRoutes.features.path,
    description: "Explore capabilities, workflows, and platform benefits",
  },
  {
    label: siteRoutes.integrations.label,
    to: siteRoutes.integrations.path,
    description: "See how the platform fits into your existing workflow",
  },
];

export const companyNavigationItems: NavigationDropdownItem[] = [
  {
    label: siteRoutes.about.label,
    to: siteRoutes.about.path,
    description: "Learn about Workforce ERP",
  },
  {
    label: siteRoutes.contact.label,
    to: siteRoutes.contact.path,
    description: "Talk with our product and support teams",
  },
];

export const resourceNavigationItems: NavigationDropdownItem[] = [
  {
    label: siteRoutes.features.label,
    to: siteRoutes.features.path,
    description: "Review the available mini-platform capabilities",
  },
  {
    label: siteRoutes.contact.label,
    to: siteRoutes.contact.path,
    description: "Contact the team for implementation guidance",
  },
];

export const siteNavigationItems: SiteNavigationItem[] = [
  {
    label: "Product",
    to: siteRoutes.features.path,
    items: productNavigationItems,
  },
  {
    label: "Company",
    to: siteRoutes.about.path,
    items: companyNavigationItems,
  },
];

export const desktopNavigationItems: NavigationItem[] = siteNavigationItems.map(
  ({ end, label, to }) => ({ label, to, ...(end !== undefined ? { end } : {}) }),
);

export const legalNavigationItems: NavigationItem[] = [];

export const footerNavigationGroups = [
  {
    heading: "Product",
    items: [
      { label: siteRoutes.features.label, to: siteRoutes.features.path },
      { label: "Platform overview", to: siteRoutes.home.path },
      { label: siteRoutes.demoRequest.label, to: siteRoutes.demoRequest.path },
      { label: "Sign in", to: WEB_PATHS.signIn },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "Feature guide", to: siteRoutes.features.path },
      { label: "Implementation help", to: siteRoutes.contact.path },
      { label: "Product overview", to: siteRoutes.home.path },
      { label: "Support", to: siteRoutes.contact.path },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: siteRoutes.about.label, to: siteRoutes.about.path },
      { label: siteRoutes.contact.label, to: siteRoutes.contact.path },
      { label: siteRoutes.demoRequest.label, to: siteRoutes.demoRequest.path },
      { label: "Workforce ERP", to: siteRoutes.home.path },
    ],
  },
  {
    heading: "Workspace",
    items: [
      { label: "Sign in", to: WEB_PATHS.signIn },
      { label: siteRoutes.features.label, to: siteRoutes.features.path },
      { label: siteRoutes.about.label, to: siteRoutes.about.path },
      { label: siteRoutes.contact.label, to: siteRoutes.contact.path },
    ],
  },
] satisfies Array<{ heading: string; items: NavigationItem[] }>;

export const mobileNavigationItems: NavigationItem[] = [
  { label: siteRoutes.home.label, to: siteRoutes.home.path, end: true },
  ...primaryNavigationItems,
];

export const mobilePrimaryNavigationItems: NavigationItem[] = mobileNavigationItems;

export const mobileNavigationGroups = footerNavigationGroups;
