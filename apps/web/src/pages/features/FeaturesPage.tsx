import {
  FaqSection,
  FeatureComparisonSection,
  FeatureGridSection,
  FeaturesCallToActionSection,
  FeaturesHeroSection,
  WorkflowSection,
} from "#features/features/components/feature-sections";

export default function FeaturesPage() {
  return (
    <main>
      <FeaturesHeroSection />
      <FeatureGridSection />
      <FeatureComparisonSection />
      <WorkflowSection />
      <FaqSection />
      <FeaturesCallToActionSection />
    </main>
  );
}
