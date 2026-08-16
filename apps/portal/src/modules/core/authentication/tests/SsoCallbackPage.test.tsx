import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  completeSso: vi.fn(),
  signIn: vi.fn(),
}))

vi.mock("@workforce-erp/auth-client", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}))

vi.mock("@/modules/core/authentication/api/authentication.api", () => ({
  authenticationApi: {
    completeSso: mocks.completeSso,
  },
  toAuthSession: (response: {
    user: {
      id: string | number
      name: string
      email: string
      role?: string | null
      organization_id?: string | null
      organization_name?: string | null
    }
  }) => ({
    user: {
      id: String(response.user.id),
      name: response.user.name,
      email: response.user.email,
      role: response.user.role,
      organizationId: response.user.organization_id,
      organizationName: response.user.organization_name,
    },
  }),
}))

import SsoCallbackPage from "@/modules/core/authentication/pages/SsoCallbackPage"

function renderCallback(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/auth/callback/:provider" element={<SsoCallbackPage />} />
        <Route
          path="/people/employees"
          element={<div>Employees destination</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe("SsoCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it("validates browser state, creates the real auth session, and restores returnTo", async () => {
    sessionStorage.setItem("workforce-erp.sso.google.state", "expected-state")
    sessionStorage.setItem(
      "workforce-erp.sso.google.returnTo",
      "/people/employees"
    )
    mocks.completeSso.mockResolvedValue({
      success: true,
      user: {
        id: 9,
        name: "SSO User",
        email: "sso@example.com",
        role: "staff",
        organization_id: "2",
        organization_name: "Example Org",
      },
    })

    renderCallback(
      "/auth/callback/google?code=provider-code&state=expected-state"
    )

    await waitFor(() =>
      expect(mocks.completeSso).toHaveBeenCalledWith(
        "google",
        "provider-code",
        "expected-state"
      )
    )

    expect(mocks.signIn).toHaveBeenCalledWith({
      user: {
        id: "9",
        name: "SSO User",
        email: "sso@example.com",
        role: "staff",
        organizationId: "2",
        organizationName: "Example Org",
      },
    })
    expect(await screen.findByText("Employees destination")).toBeInTheDocument()
    expect(sessionStorage.getItem("workforce-erp.sso.google.state")).toBeNull()
    expect(
      sessionStorage.getItem("workforce-erp.sso.google.returnTo")
    ).toBeNull()
  })

  it("rejects a callback whose state does not match without calling the backend", async () => {
    sessionStorage.setItem("workforce-erp.sso.google.state", "expected-state")

    renderCallback(
      "/auth/callback/google?code=provider-code&state=attacker-state"
    )

    expect(
      await screen.findByText(
        "The single sign-on response is incomplete or its security state does not match."
      )
    ).toBeInTheDocument()
    expect(mocks.completeSso).not.toHaveBeenCalled()
    expect(mocks.signIn).not.toHaveBeenCalled()
    expect(sessionStorage.getItem("workforce-erp.sso.google.state")).toBeNull()
  })
})
