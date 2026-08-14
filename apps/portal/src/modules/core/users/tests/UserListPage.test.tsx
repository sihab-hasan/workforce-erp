import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import UserListPage from "../pages/UserListPage"

// Mock hooks
vi.mock("../hooks/use-users", () => ({
  useUsers: () => ({
    data: {
      data: [
        {
          id: "u-1",
          name: "Diana Prince",
          email: "diana@themyscira.internal",
          role: "owner",
          status: "active",
          organization_name: "Justice League",
          employee_id: null,
          created_at: "2026-01-01T00:00:00Z",
          last_login_at: "2026-08-12T12:00:00Z",
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
        from: 1,
        to: 1,
      },
      links: { first: null, last: null, prev: null, next: null },
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("../hooks/use-users-filters", () => ({
  useUsersFilters: () => ({
    filters: { search: "", status: "all", role: "all" },
    page: 1,
    pageSize: 15,
    queryFilters: { page: 1, per_page: 15 },
    isDirty: false,
    onFiltersChange: vi.fn(),
    onReset: vi.fn(),
    onPageChange: vi.fn(),
  }),
}))

vi.mock("../hooks/use-user-options", () => ({
  useUserFormOptions: () => ({
    organizations: [{ id: "org-1", name: "Justice League" }],
    isOrgsPending: false,
    isOrgsError: false,
    roles: [{ id: "owner", name: "Owner", slug: "owner" }],
    isRolesPending: false,
    isRolesError: false,
    employees: [],
    isEmployeesPending: false,
    isEmployeesError: false,
  }),
}))

vi.mock("../api/users.mutations", () => ({
  useInviteUser: () => ({ mutate: vi.fn(), isPending: false }),
  useActivateUser: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateUser: () => ({ mutate: vi.fn(), isPending: false }),
  useSuspendUser: () => ({ mutate: vi.fn(), isPending: false }),
  useResendInvitation: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateUserMutation: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe("UserListPage Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders page header and user data table with live users", () => {
    render(<UserListPage />)

    expect(screen.getByRole("heading", { name: /user accounts/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /invite user/i })).toBeInTheDocument()
    expect(screen.getAllByText("Diana Prince").length).toBeGreaterThan(0)
    expect(screen.getAllByText("diana@themyscira.internal").length).toBeGreaterThan(0)
  })

  it("opens Invite User dialog when clicking Invite User button", async () => {
    const user = userEvent.setup()
    render(<UserListPage />)

    const inviteBtn = screen.getByRole("button", { name: /invite user/i })
    await user.click(inviteBtn)

    expect(screen.getByRole("heading", { name: /invite new user/i })).toBeInTheDocument()
  })
})
