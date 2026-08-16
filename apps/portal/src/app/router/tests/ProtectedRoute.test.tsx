import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

let authenticated = false
vi.mock("@workforce-erp/auth-client", () => ({
  useAuth: () => ({ isAuthenticated: authenticated }),
}))

import { ProtectedRoute } from "@/app/router/protected-route"

function LocationProbe() {
  const location = useLocation()
  return (
    <div>
      {location.pathname}
      {location.search}
    </div>
  )
}

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login and preserves the requested page", () => {
    authenticated = false
    render(
      <MemoryRouter initialEntries={["/people/timesheet?page=2"]}>
        <Routes>
          <Route
            path="/people/timesheet"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth/login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/\/auth\/login\?returnTo=/)).toHaveTextContent(
      "/auth/login?returnTo=%2Fpeople%2Ftimesheet%3Fpage%3D2"
    )
    expect(screen.queryByText("Private page")).not.toBeInTheDocument()
  })

  it("renders protected content for an authenticated session", () => {
    authenticated = true
    render(
      <MemoryRouter initialEntries={["/people/timesheet"]}>
        <ProtectedRoute>
          <div>Private page</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText("Private page")).toBeInTheDocument()
  })
})
