import {
  SolutionBenefitsSection,
  SolutionChallengesSection,
  SolutionDetailsHeroSection,
  SolutionOverviewSection,
  SolutionWorkflowSection,
  SolutionsCallToActionSection,
} from "@/modules/solutions/components/solution-sections"

export default function SolutionDetailsPage() {
  return (
    <main>
      <SolutionDetailsHeroSection />
      <SolutionOverviewSection />
      <SolutionChallengesSection />
      <SolutionWorkflowSection />
      <SolutionBenefitsSection />
      <SolutionsCallToActionSection />
    </main>
  )
}
