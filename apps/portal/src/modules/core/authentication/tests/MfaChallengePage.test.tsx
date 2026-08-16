import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  signIn: vi.fn(),
}))

vi.mock("@workforce-erp/auth-client", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}))

vi.mock("@/modules/core/authentication/api/authentication.api", () => ({
  authenticationApi: {
    requestOtp: mocks.requestOtp,
    verifyOtp: mocks.verifyOtp,
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

import { MfaChallengeForm } from "@/modules/core/authentication/components/MfaChallengeForm"

describe("MfaChallengeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requests and verifies a one-time code, then creates the shared session", async () => {
    mocks.requestOtp.mockResolvedValue({
      success: true,
      message:
        "If the account is eligible and email delivery is available, a one-time code will arrive shortly.",
    })
    mocks.verifyOtp.mockResolvedValue({
      success: true,
      user: {
        id: 9,
        name: "Invited User",
        email: "invite@example.com",
        role: "staff",
        organization_id: "1",
        organization_name: "Workforce Local",
      },
    })

    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<MfaChallengeForm onSuccess={onSuccess} />)

    await user.type(
      screen.getByLabelText("Account email"),
      "invite@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Send one-time code" }))

    await waitFor(() => {
      expect(mocks.requestOtp).toHaveBeenCalledWith("invite@example.com")
    })
    expect(
      screen.getByText(
        "If the account is eligible and email delivery is available, a one-time code will arrive shortly."
      )
    ).toBeInTheDocument()

    for (const [index, digit] of ["1", "2", "3", "4", "5", "6"].entries()) {
      await user.type(screen.getByLabelText(`Digit ${index + 1}`), digit)
    }

    await user.click(screen.getByRole("button", { name: "Verify code" }))

    await waitFor(() => {
      expect(mocks.verifyOtp).toHaveBeenCalledWith(
        "invite@example.com",
        "123456"
      )
    })

    expect(mocks.signIn).toHaveBeenCalledWith({
      user: {
        id: "9",
        name: "Invited User",
        email: "invite@example.com",
        role: "staff",
        organizationId: "1",
        organizationName: "Workforce Local",
      },
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
