import type { ComponentType } from "react"
import { siteRoutes } from "@/app/config/site-map"

import ForbiddenPage from "@/app/pages/ForbiddenPage.tsx"
import MaintenancePage from "@/app/pages/MaintenancePage.tsx"
import NotFoundPage from "@/app/pages/NotFoundPage.tsx"
import ServerErrorPage from "@/app/pages/ServerErrorPage.tsx"
import LoginRedirectPage from "@/modules/auth-redirect/pages/LoginRedirectPage.tsx"
import RegisterRedirectPage from "@/modules/auth-redirect/pages/RegisterRedirectPage.tsx"
import AboutPage from "@/modules/company/pages/AboutPage.tsx"
import CareersPage from "@/modules/company/pages/CareersPage.tsx"
import PartnersPage from "@/modules/company/pages/PartnersPage.tsx"
import ContactPage from "@/modules/contact/pages/ContactPage.tsx"
import DemoRequestPage from "@/modules/contact/pages/DemoRequestPage.tsx"
import FeatureDetailsPage from "@/modules/features/pages/FeatureDetailsPage.tsx"
import FeaturesPage from "@/modules/features/pages/FeaturesPage.tsx"
import HomePage from "@/modules/home/pages/HomePage.tsx"
import IndustriesPage from "@/modules/industries/pages/IndustriesPage.tsx"
import IndustryDetailsPage from "@/modules/industries/pages/IndustryDetailsPage.tsx"
import IntegrationDetailsPage from "@/modules/integrations/pages/IntegrationDetailsPage.tsx"
import IntegrationsPage from "@/modules/integrations/pages/IntegrationsPage.tsx"
import CookiePolicyPage from "@/modules/legal/pages/CookiePolicyPage.tsx"
import PrivacyPolicyPage from "@/modules/legal/pages/PrivacyPolicyPage.tsx"
import SecurityPage from "@/modules/legal/pages/SecurityPage.tsx"
import TermsOfServicePage from "@/modules/legal/pages/TermsOfServicePage.tsx"
import PricingPage from "@/modules/pricing/pages/PricingPage.tsx"
import ArticleDetailsPage from "@/modules/resources/pages/ArticleDetailsPage.tsx"
import BlogPage from "@/modules/resources/pages/BlogPage.tsx"
import DocumentationPage from "@/modules/resources/pages/DocumentationPage.tsx"
import ResourcesPage from "@/modules/resources/pages/ResourcesPage.tsx"
import SolutionDetailsPage from "@/modules/solutions/pages/SolutionDetailsPage.tsx"
import SolutionsPage from "@/modules/solutions/pages/SolutionsPage.tsx"
import StatusPage from "@/modules/status/pages/StatusPage.tsx"

export type WebRoute = {
  path: string
  component: ComponentType
}

export const webRoutes: WebRoute[] = [
  { path: siteRoutes.home.path, component: HomePage },
  { path: siteRoutes.features.path, component: FeaturesPage },
  { path: siteRoutes.featureDetails.path, component: FeatureDetailsPage },
  { path: siteRoutes.solutions.path, component: SolutionsPage },
  { path: siteRoutes.solutionDetails.path, component: SolutionDetailsPage },
  { path: siteRoutes.industries.path, component: IndustriesPage },
  { path: siteRoutes.industryDetails.path, component: IndustryDetailsPage },
  { path: siteRoutes.integrations.path, component: IntegrationsPage },
  {
    path: siteRoutes.integrationDetails.path,
    component: IntegrationDetailsPage,
  },
  { path: siteRoutes.pricing.path, component: PricingPage },
  { path: siteRoutes.resources.path, component: ResourcesPage },
  { path: siteRoutes.documentation.path, component: DocumentationPage },
  { path: siteRoutes.blog.path, component: BlogPage },
  { path: siteRoutes.articleDetails.path, component: ArticleDetailsPage },
  { path: siteRoutes.about.path, component: AboutPage },
  { path: siteRoutes.careers.path, component: CareersPage },
  { path: siteRoutes.partners.path, component: PartnersPage },
  { path: siteRoutes.contact.path, component: ContactPage },
  { path: siteRoutes.demoRequest.path, component: DemoRequestPage },
  { path: siteRoutes.status.path, component: StatusPage },
  { path: siteRoutes.privacyPolicy.path, component: PrivacyPolicyPage },
  { path: siteRoutes.termsOfService.path, component: TermsOfServicePage },
  { path: siteRoutes.cookiePolicy.path, component: CookiePolicyPage },
  { path: siteRoutes.security.path, component: SecurityPage },
  { path: siteRoutes.login.path, component: LoginRedirectPage },
  { path: siteRoutes.register.path, component: RegisterRedirectPage },
  { path: siteRoutes.maintenance.path, component: MaintenancePage },
  { path: siteRoutes.forbidden.path, component: ForbiddenPage },
  { path: siteRoutes.serverError.path, component: ServerErrorPage },
]

export const fallbackWebRoute: WebRoute = {
  path: siteRoutes.notFound.path,
  component: NotFoundPage,
}
