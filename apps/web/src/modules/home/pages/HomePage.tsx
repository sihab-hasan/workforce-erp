import { AiInsightsSection } from "@/modules/home/components/AiInsightsSection"
import { AutomationSection } from "@/modules/home/components/AutomationSection"
import { BusinessOverviewSection } from "@/modules/home/components/BusinessOverviewSection"
import { CallToActionSection } from "@/modules/home/components/CallToActionSection"
import { HeroSection } from "@/modules/home/components/HeroSection"
import { IntegrationStrip } from "@/modules/home/components/IntegrationStrip"
import { ModuleShowcaseSection } from "@/modules/home/components/ModuleShowcaseSection"
import { TestimonialsSection } from "@/modules/home/components/TestimonialsSection"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <BusinessOverviewSection />
      <ModuleShowcaseSection />
      <AutomationSection />
      <AiInsightsSection />
      <TestimonialsSection />
      <IntegrationStrip />
      <CallToActionSection />
    </main>
  )
}
