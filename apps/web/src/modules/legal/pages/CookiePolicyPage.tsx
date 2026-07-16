import {
  CookieCategoriesSection,
  LegalContactSection,
  LegalHeroSection,
  LegalSummarySection,
} from "@/modules/legal/components/legal-sections"

export default function CookiePolicyPage() {
  return (
    <main>
      <LegalHeroSection />
      <LegalSummarySection />
      <CookieCategoriesSection />
      <LegalContactSection />
    </main>
  )
}
