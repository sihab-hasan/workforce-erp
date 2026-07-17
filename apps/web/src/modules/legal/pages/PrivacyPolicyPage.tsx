import {
  LegalContactSection,
  LegalHeroSection,
  LegalSummarySection,
  PolicySectionsBlock,
} from "@/modules/legal/components/legal-sections"

export default function PrivacyPolicyPage() {
  return (
    <main>
      <LegalHeroSection />
      <LegalSummarySection />
      <PolicySectionsBlock />
      <LegalContactSection />
    </main>
  )
}
