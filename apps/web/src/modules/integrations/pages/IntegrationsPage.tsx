import {
  IntegrationCategoriesSection,
  IntegrationGridSection,
  IntegrationWorkflowSection,
  IntegrationsCallToActionSection,
  IntegrationsFaqSection,
  IntegrationsHeroSection,
} from "@/modules/integrations/components/integration-sections"

export default function IntegrationsPage() {
  return (
    <main>
      <IntegrationsHeroSection />
      <IntegrationGridSection />
      <IntegrationCategoriesSection />
      <IntegrationWorkflowSection />
      <IntegrationsFaqSection />
      <IntegrationsCallToActionSection />
    </main>
  )
}
