import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserTable } from "../components/UserTable"
import type { UserSummary } from "../types/users.types"

// Mock mutations and option queries
vi.mock("../api/users.mutations", () => ({
  useActivateUser: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateUser: () => ({ mutate: vi.fn(), isPending: false }),
  useSuspendUser: () => ({ mutate: vi.fn(), isPending: false }),
  useResendInvitation: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateUserMutation: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock("../hooks/use-user-options", () => ({
  useUserFormOptions: () => ({
    organizations: [{ id: "org-1", name: "Acme Corp" }],
    isOrgsPending: false,
    isOrgsError: false,
    roles: [{ id: "admin", name: "Admin", slug: "admin" }],
    isRolesPending: false,
    isRolesError: false,
    employees: [],
    isEmployeesPending: false,
    isEmployeesError: false,
  }),
}))

const MOCK_USERS: UserSummary[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    email: "alice@acme.com",
    role: "admin",
    status: "active",
    organization_name: "Acme Corp",
    employee_id: "emp-101",
    created_at: "2026-01-15T10:00:00Z",
    last_login_at: "2026-08-10T14:30:00Z",
  },
  {
    id: "user-2",
    name: "Bob Smith",
    email: "bob@acme.com",
    role: "staff",
    status: "invited",
    organization_name: "Acme Corp",
    employee_id: null,
    created_at: "2026-08-01T09:00:00Z",
    last_login_at: null,
  },
]

describe("UserTable Component", () => {
  const defaultProps = {
    users: MOCK_USERS,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    isPending: false,
    isError: false,
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state with skeleton placeholders when isPending is true", () => {
    render(<UserTable {...defaultProps} isPending={true} />)

    expect(screen.getByText(/loading user accounts/i)).toBeInTheDocument()
  })

  it("renders error state with retry button when isError is true", async () => {
    const user = userEvent.setup()
    render(<UserTable {...defaultProps} isError={true} />)

    expect(screen.getAllByText(/failed to load users/i).length).toBeGreaterThan(0)
    const retryButtons = screen.getAllByRole("button", { name: /try again/i })
    expect(retryButtons.length).toBeGreaterThan(0)

    await user.click(retryButtons[0])
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
  })

  it("renders empty state when users array is empty", () => {
    render(<UserTable {...defaultProps} users={[]} totalCount={0} />)

    expect(screen.getAllByText(/no users found/i).length).toBeGreaterThan(0)
  })

  it("renders user rows with name, email, role badge, organization, and status", () => {
    render(<UserTable {...defaultProps} />)

    // User names and emails
    expect(screen.getAllByText("Alice Johnson").length).toBeGreaterThan(0)
    expect(screen.getAllByText("alice@acme.com").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Bob Smith").length).toBeGreaterThan(0)
    expect(screen.getAllByText("bob@acme.com").length).toBeGreaterThan(0)

    // Roles
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Staff").length).toBeGreaterThan(0)

    // Organization
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0)

    // Status Badges
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Invited").length).toBeGreaterThan(0)

    // Linked employee badge for Alice
    expect(screen.getAllByText(/employee/i).length).toBeGreaterThan(0)
  })

  it("renders pagination controls when totalPages > 1", async () => {
    const user = userEvent.setup()
    render(
      <UserTable
        {...defaultProps}
        totalCount={25}
        pageSize={10}
        page={1}
      />,
    )

    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
    const page2Button = screen.getByRole("button", { name: "2" })
    await user.click(page2Button)

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
  })
})
