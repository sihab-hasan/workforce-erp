import {
  MissingPageSection,
  SuggestedPathsSection,
} from "@/app/pages/system-sections"

export default function NotFoundPage() {
  return (
    <main>
      <MissingPageSection />
      <SuggestedPathsSection />
    </main>
  )
}
