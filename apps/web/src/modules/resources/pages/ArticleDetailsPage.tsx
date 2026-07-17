import {
  ArticleContentSection,
  RelatedArticlesSection,
  ResourcesCallToActionSection,
  ResourcesHeroSection,
} from "@/modules/resources/components/resource-sections"

export default function ArticleDetailsPage() {
  return (
    <main>
      <ResourcesHeroSection />
      <ArticleContentSection />
      <RelatedArticlesSection />
      <ResourcesCallToActionSection />
    </main>
  )
}
