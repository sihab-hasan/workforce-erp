import {
  CurrentStatusSection,
  IncidentTimelineSection,
  ServiceHistorySection,
  StatusHeroSection,
  SubscribeSection,
} from "@/modules/status/components/status-sections"

export default function StatusPage() {
  return (
    <main>
      <StatusHeroSection />
      <CurrentStatusSection />
      <IncidentTimelineSection />
      <ServiceHistorySection />
      <SubscribeSection />
    </main>
  )
}
