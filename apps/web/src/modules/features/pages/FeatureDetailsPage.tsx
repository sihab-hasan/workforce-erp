import {
  FeatureBenefitsSection,
  FeatureCapabilitiesSection,
  FeatureDetailsHeroSection,
  FeaturesCallToActionSection,
  FeatureOverviewSection,
  FeatureUseCasesSection,
} from "@/modules/features/components/feature-sections"

export default function FeatureDetailsPage() {
  return (
    <main>
      <FeatureDetailsHeroSection />
      <FeatureOverviewSection />
      <FeatureCapabilitiesSection />
      <FeatureBenefitsSection />
      <FeatureUseCasesSection />
      <FeaturesCallToActionSection />
    </main>
  )
}
