import { siteRoutes } from "@/app/config/site-map"

export const authRedirectNavigationItems = [
  { label: siteRoutes.login.label, to: siteRoutes.login.path },
  { label: siteRoutes.register.label, to: siteRoutes.register.path },
]
