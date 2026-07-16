import {
  ControlsSection,
  LegalContactSection,
  LegalHeroSection,
  SecurityOverviewSection,
} from "@/modules/legal/components/legal-sections"

export default function SecurityPage() {
  return (
    <main>
      <LegalHeroSection />
      <SecurityOverviewSection />
      <ControlsSection />
      <LegalContactSection />
    </main>
  )
}
