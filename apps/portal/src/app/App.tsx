import { useEffect, useState } from "react"

import { AppProviders } from "@/app/providers/AppProviders.tsx"
import { PortalRouter } from "@/app/router/router.tsx"
import { apiClient } from "@/lib/api"

export function App() {
  const [apiStatus, setApiStatus] = useState("Connecting...")

  useEffect(() => {
    apiClient
      .getHealth()
      .then((payload) => setApiStatus(`${payload.status} · ${payload.service}`))
      .catch(() => setApiStatus("API unavailable"))
  }, [])

  return (
    <AppProviders>
      <div className="p-6">
        <p className="mb-4 text-sm text-slate-600">
          Portal API status: {apiStatus}
        </p>
        <PortalRouter />
      </div>
    </AppProviders>
  )
}
