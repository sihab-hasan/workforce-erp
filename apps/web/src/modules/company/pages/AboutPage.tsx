import {
  CompanyCallToActionSection,
  CompanyHeroSection,
  CompanyStorySection,
  LeadershipSectionBlock,
  TimelineSection,
  ValuesSection,
} from "@/modules/company/components/company-sections"

export default function AboutPage() {
  return (
    <main>
      <CompanyHeroSection />
      <CompanyStorySection />
      <TimelineSection />
      <LeadershipSectionBlock />
      <ValuesSection />
      <CompanyCallToActionSection />
    </main>
  )
}
