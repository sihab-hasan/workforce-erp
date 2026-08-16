import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  signIn: vi.fn(),
}))

vi.mock("@workforce-erp/auth-client", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}))

vi.mock("@/modules/core/authentication/api/authentication.api", () => ({
  authenticationApi: {
    login: mocks.login,
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

import { LoginForm } from "@/modules/core/authentication/components/LoginForm"

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates the shared auth session after a successful password login", async () => {
    const onSuccess = vi.fn()
    mocks.login.mockResolvedValue({
      success: true,
      user: {
        id: 7,
        name: "Local Owner",
        email: "owner@workforce.local",
        role: "owner",
        organization_id: "1",
        organization_name: "Workforce Local",
      },
    })

    const user = userEvent.setup()
    render(<LoginForm onSuccess={onSuccess} />)

    await user.type(
      screen.getByLabelText("Email address"),
      " Owner@Workforce.Local "
    )
    await user.type(screen.getByLabelText("Password"), "ChangeMe123!")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith(
        "Owner@Workforce.Local",
        "ChangeMe123!"
      )
    })

    expect(mocks.signIn).toHaveBeenCalledWith({
      user: {
        id: "7",
        name: "Local Owner",
        email: "owner@workforce.local",
        role: "owner",
        organizationId: "1",
        organizationName: "Workforce Local",
      },
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it("does not call the API when required credentials are missing", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please fill in all fields."
    )
    expect(mocks.login).not.toHaveBeenCalled()
    expect(mocks.signIn).not.toHaveBeenCalled()
  })
})
