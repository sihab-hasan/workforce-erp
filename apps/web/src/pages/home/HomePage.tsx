import { AiInsightsSection } from "#features/home/components/AiInsightsSection";
import { AutomationSection } from "#features/home/components/AutomationSection";
import { BusinessOverviewSection } from "#features/home/components/BusinessOverviewSection";
import { CallToActionSection } from "#features/home/components/CallToActionSection";
import { HeroSection } from "#features/home/components/HeroSection";
import { IntegrationStrip } from "#features/home/components/IntegrationStrip";
import { ModuleShowcaseSection } from "#features/home/components/ModuleShowcaseSection";
import { TestimonialsSection } from "#features/home/components/TestimonialsSection";

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
  );
}
