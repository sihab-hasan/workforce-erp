import {
  FeaturedArticlesSection,
  LatestPostsSection,
  ResourceCategoriesSection,
  ResourcesHeroSection,
} from "@/modules/resources/components/resource-sections"

export default function BlogPage() {
  return (
    <main>
      <ResourcesHeroSection />
      <FeaturedArticlesSection />
      <LatestPostsSection />
      <ResourceCategoriesSection />
    </main>
  )
}
