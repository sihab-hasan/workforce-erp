import {
  ErrorDetailsSection,
  RecoveryOptionsSection,
} from "@/app/pages/system-sections"

export default function ServerErrorPage() {
  return (
    <main>
      <ErrorDetailsSection />
      <RecoveryOptionsSection />
    </main>
  )
}
