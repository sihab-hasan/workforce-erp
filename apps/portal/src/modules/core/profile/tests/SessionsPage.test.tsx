import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  sessions: vi.fn(),
  revokeSession: vi.fn(),
  logoutAll: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("@workforce-erp/auth-client", () => ({
  useAuth: () => ({ signOut: mocks.signOut }),
}))

vi.mock("@/modules/core/profile/api/profile.api", () => ({
  profileSecurityApi: {
    sessions: mocks.sessions,
    revokeSession: mocks.revokeSession,
    logoutAll: mocks.logoutAll,
  },
}))

import SessionsPage from "@/modules/core/profile/pages/SessionsPage"

describe("SessionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.sessions.mockResolvedValue({
      success: true,
      data: [
        {
          id: "10",
          name: "portal",
          created_at: "2026-08-16T00:00:00+00:00",
          last_used_at: null,
          expires_at: null,
          current: true,
        },
        {
          id: "11",
          name: "portal",
          created_at: "2026-08-15T00:00:00+00:00",
          last_used_at: null,
          expires_at: null,
          current: false,
        },
      ],
    })
  })

  it("loads real token sessions and revokes another session", async () => {
    mocks.revokeSession.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>
    )

    await screen.findByText(/portal \(current\)/i)
    const revokeButtons = screen.getAllByRole("button", { name: "Revoke" })
    await user.click(revokeButtons[1]!)

    await waitFor(() => expect(mocks.revokeSession).toHaveBeenCalledWith("11"))
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it("logs out every session through the backend and clears local auth", async () => {
    mocks.logoutAll.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>
    )

    await screen.findByText(/portal \(current\)/i)
    await user.click(screen.getByRole("button", { name: "Log out all" }))

    await waitFor(() => expect(mocks.logoutAll).toHaveBeenCalledTimes(1))
    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })
})
