import {
  BenefitsSection,
  CompanyCallToActionSection,
  CompanyHeroSection,
  HiringProcessSection,
  OpenRolesSection,
} from "@/modules/company/components/company-sections"

export default function CareersPage() {
  return (
    <main>
      <CompanyHeroSection />
      <OpenRolesSection />
      <BenefitsSection />
      <HiringProcessSection />
      <CompanyCallToActionSection />
    </main>
  )
}
