import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("@workforce-erp/auth-client", () => ({
  useAuth: () => ({
    session: {
      user: { email: "owner@workforce.local" },
    },
    signOut: mocks.signOut,
  }),
}))

vi.mock("@/modules/core/profile/api/profile.api", () => ({
  profileSecurityApi: {
    changePassword: mocks.changePassword,
  },
}))

import AccountSecurityPage from "@/modules/core/profile/pages/AccountSecurityPage"

describe("AccountSecurityPage", () => {
  beforeEach(() => vi.clearAllMocks())

  it("changes the password through the backend then clears the local session", async () => {
    mocks.changePassword.mockResolvedValue({ success: true })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AccountSecurityPage />
      </MemoryRouter>
    )

    await user.type(
      screen.getByLabelText("Current password"),
      "CurrentPass123!"
    )
    await user.type(screen.getByLabelText("New password"), "ChangedPass123!")
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "ChangedPass123!"
    )
    await user.click(screen.getByRole("button", { name: "Change password" }))

    await waitFor(() => {
      expect(mocks.changePassword).toHaveBeenCalledWith({
        current_password: "CurrentPass123!",
        password: "ChangedPass123!",
        password_confirmation: "ChangedPass123!",
      })
    })
    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })
})
