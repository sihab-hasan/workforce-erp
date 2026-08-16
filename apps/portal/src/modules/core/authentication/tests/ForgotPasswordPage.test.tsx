import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
}))

vi.mock("@/modules/core/authentication/api/authentication.api", () => ({
  authenticationApi: {
    requestPasswordReset: mocks.requestPasswordReset,
  },
}))

import { ForgotPasswordForm } from "@/modules/core/authentication/components/ForgotPasswordForm"

describe("ForgotPasswordForm", () => {
  beforeEach(() => vi.clearAllMocks())

  it("requests a real password reset link and shows the generic success state", async () => {
    mocks.requestPasswordReset.mockResolvedValue({
      success: true,
      message:
        "If the account is eligible and email delivery is available, a password reset link will arrive shortly.",
    })

    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText("Email address"), "user@example.com")
    await user.click(screen.getByRole("button", { name: "Send reset link" }))

    await waitFor(() => {
      expect(mocks.requestPasswordReset).toHaveBeenCalledWith(
        "user@example.com"
      )
    })
    expect(screen.getByText("Check your inbox")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /set new password/i })
    ).not.toBeInTheDocument()
  })
})
