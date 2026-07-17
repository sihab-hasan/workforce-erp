import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { apiClient } from "@/lib/api"

import { Container } from "./container"

const announcements = [
  "🚀 Workforce ERP is now available with AI-powered business insights.",
  "⚡ Automate your business workflows with Workforce ERP.",
]

function ApiStatusAnnouncement({
  status,
  hidden = false,
}: {
  status: string
  hidden?: boolean
}) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {announcements.map((announcement) => (
        <span
          key={announcement}
          className="inline-flex items-center text-xs whitespace-nowrap sm:text-sm"
        >
          <span className="mx-6 sm:mx-8">{announcement}</span>
          <span className="opacity-40" aria-hidden="true">
            •
          </span>
        </span>
      ))}
      <span className="inline-flex items-center text-xs whitespace-nowrap sm:text-sm">
        <span className="mx-6 sm:mx-8">Web API status: {status}</span>
        <span className="opacity-40" aria-hidden="true">
          •
        </span>
      </span>
    </div>
  )
}

export default function SiteTopbar() {
  const [apiStatus, setApiStatus] = useState("Connecting...")

  useEffect(() => {
    apiClient
      .getHealth()
      .then((payload) => setApiStatus(`${payload.status} · ${payload.service}`))
      .catch(() => setApiStatus("API unavailable"))
  }, [])

  return (
    <div className="w-full overflow-hidden border-b border-primary-foreground/15 bg-primary text-primary-foreground">
      <Container className="flex h-10 items-center gap-3">
        <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wider uppercase">
          New
        </span>

        <div
          className="marketing-marquee min-w-0 flex-1 overflow-hidden"
          aria-label={`${announcements.join(" ")} Web API status: ${apiStatus}`}
        >
          <div className="marketing-marquee-track flex w-max items-center">
            <ApiStatusAnnouncement status={apiStatus} />
            <ApiStatusAnnouncement status={apiStatus} hidden />
          </div>
        </div>

        <Link
          to="/features"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none sm:text-sm"
        >
          <span className="hidden sm:inline">Learn More</span>
          <span className="sm:hidden">More</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Container>
    </div>
  )
}
