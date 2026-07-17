import {
  CompanyCallToActionSection,
  CompanyHeroSection,
  PartnerBenefitsSection,
  PartnerNetworkSection,
  PartnerProgramsSection,
} from "@/modules/company/components/company-sections"

export default function PartnersPage() {
  return (
    <main>
      <CompanyHeroSection />
      <PartnerNetworkSection />
      <PartnerBenefitsSection />
      <PartnerProgramsSection />
      <CompanyCallToActionSection />
    </main>
  )
}
