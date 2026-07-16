import {
  FeaturedResourcesSection,
  ResourceCategoriesSection,
  ResourceLibrarySection,
  ResourcesCallToActionSection,
  ResourcesHeroSection,
} from "@/modules/resources/components/resource-sections"

export default function ResourcesPage() {
  return (
    <main>
      <ResourcesHeroSection />
      <FeaturedResourcesSection />
      <ResourceLibrarySection />
      <ResourceCategoriesSection />
      <ResourcesCallToActionSection />
    </main>
  )
}
