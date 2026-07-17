import type {
  NavigationDropdownItem,
  NavigationItem,
} from "@/shared/components/navigation"

export type SiteNavigationItem = NavigationItem & {
  items?: NavigationDropdownItem[]
}

export type SiteRouteDefinition = {
  key: string
  label: string
  path: string
}

export const siteRoutes = {
  home: { key: "home", label: "Home", path: "/" },
  features: { key: "features", label: "Features", path: "/features" },
  featureDetails: {
    key: "featureDetails",
    label: "Feature Details",
    path: "/features/:slug",
  },
  solutions: { key: "solutions", label: "Solutions", path: "/solutions" },
  solutionDetails: {
    key: "solutionDetails",
    label: "Solution Details",
    path: "/solutions/:slug",
  },
  industries: { key: "industries", label: "Industries", path: "/industries" },
  industryDetails: {
    key: "industryDetails",
    label: "Industry Details",
    path: "/industries/:slug",
  },
  integrations: {
    key: "integrations",
    label: "Integrations",
    path: "/integrations",
  },
  integrationDetails: {
    key: "integrationDetails",
    label: "Integration Details",
    path: "/integrations/:slug",
  },
  pricing: { key: "pricing", label: "Pricing", path: "/pricing" },
  resources: { key: "resources", label: "Resources", path: "/resources" },
  documentation: {
    key: "documentation",
    label: "Documentation",
    path: "/documentation",
  },
  blog: { key: "blog", label: "Blog", path: "/blog" },
  articleDetails: {
    key: "articleDetails",
    label: "Article Details",
    path: "/blog/:slug",
  },
  about: { key: "about", label: "About", path: "/about" },
  careers: { key: "careers", label: "Careers", path: "/careers" },
  partners: { key: "partners", label: "Partners", path: "/partners" },
  contact: { key: "contact", label: "Contact", path: "/contact" },
  demoRequest: {
    key: "demoRequest",
    label: "Request Demo",
    path: "/request-demo",
  },
  status: { key: "status", label: "Status", path: "/status" },
  privacyPolicy: {
    key: "privacyPolicy",
    label: "Privacy Policy",
    path: "/privacy",
  },
  termsOfService: {
    key: "termsOfService",
    label: "Terms of Service",
    path: "/terms",
  },
  cookiePolicy: {
    key: "cookiePolicy",
    label: "Cookie Policy",
    path: "/cookies",
  },
  security: { key: "security", label: "Security", path: "/security" },
  maintenance: {
    key: "maintenance",
    label: "Maintenance",
    path: "/system/maintenance",
  },
  forbidden: {
    key: "forbidden",
    label: "Forbidden",
    path: "/system/forbidden",
  },
  serverError: {
    key: "serverError",
    label: "Server Error",
    path: "/system/server-error",
  },
  notFound: { key: "notFound", label: "Not Found", path: "/404" },
} satisfies Record<string, SiteRouteDefinition>

export const primaryNavigationItems: NavigationItem[] = [
  { label: siteRoutes.solutions.label, to: siteRoutes.solutions.path },
  { label: siteRoutes.industries.label, to: siteRoutes.industries.path },
  { label: siteRoutes.pricing.label, to: siteRoutes.pricing.path },
]

export const productNavigationItems: NavigationDropdownItem[] = [
  {
    label: siteRoutes.features.label,
    to: siteRoutes.features.path,
    description: "Explore capabilities, workflows, and platform benefits",
  },
  {
    label: siteRoutes.integrations.label,
    to: siteRoutes.integrations.path,
    description: "Connect the tools your teams already use",
  },
]

export const companyNavigationItems: NavigationDropdownItem[] = [
  {
    label: siteRoutes.about.label,
    to: siteRoutes.about.path,
    description: "Story, leadership, and company values",
  },
  {
    label: siteRoutes.careers.label,
    to: siteRoutes.careers.path,
    description: "Open roles, benefits, and hiring journey",
  },
  {
    label: siteRoutes.partners.label,
    to: siteRoutes.partners.path,
    description: "Programs, alliances, and partner ecosystem",
  },
  {
    label: siteRoutes.contact.label,
    to: siteRoutes.contact.path,
    description: "Talk with our product and support teams",
  },
]

export const resourceNavigationItems: NavigationDropdownItem[] = [
  {
    label: "Resource Hub",
    to: siteRoutes.resources.path,
    description: "Featured materials, guides, and learning paths",
  },
  {
    label: siteRoutes.documentation.label,
    to: siteRoutes.documentation.path,
    description: "Implementation guides, references, and setup docs",
  },
  {
    label: siteRoutes.blog.label,
    to: siteRoutes.blog.path,
    description: "Insights, updates, and practical product thinking",
  },
  {
    label: siteRoutes.status.label,
    to: siteRoutes.status.path,
    description: "Live uptime, maintenance notices, and incident updates",
  },
]

export const siteNavigationItems: SiteNavigationItem[] = [
  {
    label: "Product",
    to: siteRoutes.features.path,
    items: productNavigationItems,
  },
  ...primaryNavigationItems,
  {
    label: siteRoutes.resources.label,
    to: siteRoutes.resources.path,
    items: resourceNavigationItems,
  },
  {
    label: "Company",
    to: siteRoutes.about.path,
    items: companyNavigationItems,
  },
]

export const desktopNavigationItems: NavigationItem[] = siteNavigationItems.map(
  ({ end, label, to }) => ({
    end,
    label,
    to,
  })
)

export const legalNavigationItems: NavigationItem[] = [
  { label: siteRoutes.privacyPolicy.label, to: siteRoutes.privacyPolicy.path },
  {
    label: siteRoutes.termsOfService.label,
    to: siteRoutes.termsOfService.path,
  },
  { label: siteRoutes.cookiePolicy.label, to: siteRoutes.cookiePolicy.path },
  { label: siteRoutes.security.label, to: siteRoutes.security.path },
]

export const footerNavigationGroups = [
  {
    heading: "Product",
    items: [
      { label: siteRoutes.solutions.label, to: siteRoutes.solutions.path },
      { label: siteRoutes.features.label, to: siteRoutes.features.path },
      { label: siteRoutes.industries.label, to: siteRoutes.industries.path },
      { label: siteRoutes.pricing.label, to: siteRoutes.pricing.path },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: siteRoutes.resources.label, to: siteRoutes.resources.path },
      {
        label: siteRoutes.documentation.label,
        to: siteRoutes.documentation.path,
      },
      { label: siteRoutes.blog.label, to: siteRoutes.blog.path },
      { label: siteRoutes.status.label, to: siteRoutes.status.path },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: siteRoutes.about.label, to: siteRoutes.about.path },
      { label: siteRoutes.careers.label, to: siteRoutes.careers.path },
      { label: siteRoutes.partners.label, to: siteRoutes.partners.path },
      { label: siteRoutes.contact.label, to: siteRoutes.contact.path },
    ],
  },
  {
    heading: "Legal",
    items: legalNavigationItems,
  },
] satisfies Array<{ heading: string; items: NavigationItem[] }>

export const mobileNavigationItems: NavigationItem[] = [
  { label: siteRoutes.home.label, to: siteRoutes.home.path, end: true },
  ...siteNavigationItems.flatMap((item) => {
    const nestedItems = item.items?.map(({ end, label, to }) => ({
      end,
      label,
      to,
    }))

    return nestedItems?.length
      ? nestedItems
      : [{ end: item.end, label: item.label, to: item.to }]
  }),
]

export const mobilePrimaryNavigationItems: NavigationItem[] = [
  { label: siteRoutes.home.label, to: siteRoutes.home.path, end: true },
  ...primaryNavigationItems,
]

export const mobileNavigationGroups = [
  {
    heading: "Product",
    items: productNavigationItems,
  },
  {
    heading: "Resources",
    items: [
      { label: siteRoutes.resources.label, to: siteRoutes.resources.path },
      {
        label: siteRoutes.documentation.label,
        to: siteRoutes.documentation.path,
      },
      { label: siteRoutes.blog.label, to: siteRoutes.blog.path },
      { label: siteRoutes.status.label, to: siteRoutes.status.path },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: siteRoutes.about.label, to: siteRoutes.about.path },
      { label: siteRoutes.careers.label, to: siteRoutes.careers.path },
      { label: siteRoutes.partners.label, to: siteRoutes.partners.path },
      { label: siteRoutes.contact.label, to: siteRoutes.contact.path },
    ],
  },
] satisfies Array<{ heading: string; items: NavigationItem[] }>
