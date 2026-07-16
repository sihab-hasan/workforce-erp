import {
  SolutionGridSection,
  SolutionOutcomesSection,
  SolutionWorkflowsSection,
  SolutionsCallToActionSection,
  SolutionsFaqSection,
  SolutionsHeroSection,
} from "@/modules/solutions/components/solution-sections"

export default function SolutionsPage() {
  return (
    <main>
      <SolutionsHeroSection />
      <SolutionGridSection />
      <SolutionWorkflowsSection />
      <SolutionOutcomesSection />
      <SolutionsFaqSection />
      <SolutionsCallToActionSection />
    </main>
  )
}
