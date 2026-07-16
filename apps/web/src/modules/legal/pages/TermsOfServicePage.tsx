import {
  LegalContactSection,
  LegalHeroSection,
  LegalSummarySection,
  TermsSectionsBlock,
} from "@/modules/legal/components/legal-sections"

export default function TermsOfServicePage() {
  return (
    <main>
      <LegalHeroSection />
      <LegalSummarySection />
      <TermsSectionsBlock />
      <LegalContactSection />
    </main>
  )
}
