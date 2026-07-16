import {
  DocumentationApiReferenceSection,
  DocumentationFaqSection,
  DocumentationGettingStartedSection,
  DocumentationGuidesSection,
  ResourcesHeroSection,
} from "@/modules/resources/components/resource-sections"

export default function DocumentationPage() {
  return (
    <main>
      <ResourcesHeroSection />
      <DocumentationGettingStartedSection />
      <DocumentationGuidesSection />
      <DocumentationApiReferenceSection />
      <DocumentationFaqSection />
    </main>
  )
}
