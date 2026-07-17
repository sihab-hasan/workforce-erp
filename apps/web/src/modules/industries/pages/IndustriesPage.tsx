import {
  IndustriesCallToActionSection,
  IndustriesFaqSection,
  IndustriesHeroSection,
  IndustryGridSection,
  IndustryOutcomesSection,
  IndustryUseCasesSection,
} from "@/modules/industries/components/industry-sections"

export default function IndustriesPage() {
  return (
    <main>
      <IndustriesHeroSection />
      <IndustryGridSection />
      <IndustryUseCasesSection />
      <IndustryOutcomesSection />
      <IndustriesFaqSection />
      <IndustriesCallToActionSection />
    </main>
  )
}
