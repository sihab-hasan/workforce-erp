import {
  IndustriesCallToActionSection,
  IndustryComplianceSection,
  IndustryDetailsHeroSection,
  IndustryOutcomesSection,
  IndustryOverviewSection,
  IndustryUseCasesSection,
} from "@/modules/industries/components/industry-sections"

export default function IndustryDetailsPage() {
  return (
    <main>
      <IndustryDetailsHeroSection />
      <IndustryOverviewSection />
      <IndustryUseCasesSection />
      <IndustryComplianceSection />
      <IndustryOutcomesSection />
      <IndustriesCallToActionSection />
    </main>
  )
}
