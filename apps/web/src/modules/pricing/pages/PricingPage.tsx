import {
  PlanComparisonSection,
  PricingCallToActionSection,
  PricingCardsSection,
  PricingFaqSection,
  PricingHeroSection,
  PricingToggleSection,
} from "@/modules/pricing/components/pricing-sections"

export default function PricingPage() {
  return (
    <main>
      <PricingHeroSection />
      <PricingToggleSection />
      <PricingCardsSection />
      <PlanComparisonSection />
      <PricingFaqSection />
      <PricingCallToActionSection />
    </main>
  )
}
