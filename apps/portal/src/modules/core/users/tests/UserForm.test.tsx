import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserForm } from "../components/UserForm"

// Mock the option fetching hook
vi.mock("../hooks/use-user-options", () => ({
  useUserFormOptions: () => ({
    organizations: [
      { id: "org-1", name: "Acme Corp" },
      { id: "org-2", name: "Globex" },
    ],
    isOrgsPending: false,
    isOrgsError: false,
    roles: [
      { id: "admin", name: "Administrator", slug: "admin", description: "Admin access" },
      { id: "staff", name: "Staff Member", slug: "staff", description: "Standard user" },
    ],
    isRolesPending: false,
    isRolesError: false,
    employees: [
      { id: "emp-1", name: "John Doe", department: "Engineering", designation: "Software Engineer" },
    ],
    isEmployeesPending: false,
    isEmployeesError: false,
  }),
}))

describe("UserForm Component", () => {
  const defaultProps = {
    isPending: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders all form fields including Name, Email, Role, Organization, and Employee link", () => {
    render(<UserForm {...defaultProps} />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/system role/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/link to employee profile/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send invitation/i })).toBeInTheDocument()
  })

  it("displays validation errors when submitting with empty fields", async () => {
    const user = userEvent.setup()
    render(<UserForm {...defaultProps} />)

    const submitBtn = screen.getByRole("button", { name: /send invitation/i })
    await user.click(submitBtn)

    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it("displays validation error when entering an invalid email format", async () => {
    const user = userEvent.setup()
    render(<UserForm {...defaultProps} />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)

    await user.type(nameInput, "Jane Smith")
    await user.type(emailInput, "not-an-email")
    await user.tab()

    const submitBtn = screen.getByRole("button", { name: /send invitation/i })
    await user.click(submitBtn)

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it("submits valid form data correctly", async () => {
    const user = userEvent.setup()
    render(<UserForm {...defaultProps} />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)

    await user.type(nameInput, "Jane Smith")
    await user.type(emailInput, "jane.smith@example.com")

    const submitBtn = screen.getByRole("button", { name: /send invitation/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "staff",
        organization_id: undefined,
        employee_id: null,
      })
    })
  })

  it("disables all inputs and submit button when isPending is true", () => {
    render(<UserForm {...defaultProps} isPending={true} />)

    expect(screen.getByLabelText(/full name/i)).toBeDisabled()
    expect(screen.getByLabelText(/email address/i)).toBeDisabled()
    expect(screen.getByRole("button", { name: /send invitation/i })).toBeDisabled()
  })

  it("hides email input when hideEmail is set to true (Edit mode)", () => {
    render(<UserForm {...defaultProps} hideEmail={true} initialValues={{ name: "Jane Smith", email: "jane@test.com" }} />)

    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Jane Smith")
  })
})
