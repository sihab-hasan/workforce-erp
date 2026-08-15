import { useState } from "react"
import { apiClient } from "../../lib/api"

export default function ForbiddenPage() {
  const [apiResult, setApiResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkApi = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getHealth()
      setApiResult(JSON.stringify(data))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setApiResult(`Error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Forbidden Page</h1>
      </header>
      <div className="max-w-md space-y-3 rounded border bg-slate-50 p-4">
        <h3 className="text-sm font-medium">Test API Connection:</h3>
        <button
          onClick={checkApi}
          disabled={loading}
          className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:bg-blue-300"
        >
          {loading ? "Testing..." : "Test /api/health Connection"}
        </button>
        {apiResult && (
          <pre className="overflow-auto rounded bg-slate-900 p-2 text-xs text-green-400">
            {apiResult}
          </pre>
        )}
      </div>
    </main>
  )
}
