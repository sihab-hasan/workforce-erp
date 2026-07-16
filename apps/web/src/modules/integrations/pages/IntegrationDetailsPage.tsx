import {
  IntegrationCapabilitiesSection,
  IntegrationDetailsHeroSection,
  IntegrationOverviewSection,
  IntegrationSetupSection,
  IntegrationsCallToActionSection,
  IntegrationsFaqSection,
} from "@/modules/integrations/components/integration-sections"

export default function IntegrationDetailsPage() {
  return (
    <main>
      <IntegrationDetailsHeroSection />
      <IntegrationOverviewSection />
      <IntegrationSetupSection />
      <IntegrationCapabilitiesSection />
      <IntegrationsFaqSection />
      <IntegrationsCallToActionSection />
    </main>
  )
}
