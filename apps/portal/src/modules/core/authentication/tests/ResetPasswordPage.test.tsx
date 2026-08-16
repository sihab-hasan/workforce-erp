import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
}))

vi.mock("@/modules/core/authentication/api/authentication.api", () => ({
  authenticationApi: {
    resetPassword: mocks.resetPassword,
  },
}))

import { PasswordResetForm } from "@/modules/core/authentication/components/PasswordResetForm"

describe("PasswordResetForm", () => {
  beforeEach(() => vi.clearAllMocks())

  it("submits the token, email, and confirmed strong password to the backend", async () => {
    const onSuccess = vi.fn()
    mocks.resetPassword.mockResolvedValue({ success: true })
    const user = userEvent.setup()

    render(
      <PasswordResetForm
        email="user@example.com"
        token="reset-token"
        onSuccess={onSuccess}
      />
    )

    await user.type(screen.getByLabelText("New password"), "StrongPass123!")
    await user.type(screen.getByLabelText("Confirm password"), "StrongPass123!")
    await user.click(screen.getByRole("button", { name: "Set new password" }))

    await waitFor(() => {
      expect(mocks.resetPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        token: "reset-token",
        password: "StrongPass123!",
        password_confirmation: "StrongPass123!",
      })
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
