import { useEffect, useState } from "react"

import { apiClient } from "./lib/api"

export function App() {
  const [status, setStatus] = useState("Connecting...")

  useEffect(() => {
    apiClient
      .getHealth()
      .then((payload) => setStatus(`${payload.status} · ${payload.service}`))
      .catch(() => setStatus("API unavailable"))
  }, [])

  return (
    <div className="m-8 space-y-4">
      <h1 className="text-4xl font-semibold">Workforce ERP Admin</h1>
      <p className="text-lg text-slate-600">API status: {status}</p>
    </div>
  )
}
