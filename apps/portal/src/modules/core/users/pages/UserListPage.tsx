import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { useUsers } from "../hooks/use-users"
import { useUsersFilters } from "../hooks/use-users-filters"
import { UserFilters } from "../components/UserFilters"
import { UserTable } from "../components/UserTable"
import { UserInvitationDialog } from "../components/UserInvitationDialog"

/**
 * UserListPage
 *
 * Displays a paginated, filterable list of system user accounts.
 * Fetches live data from `GET /api/v1/users` via the useUsers hook.
 *
 * State handling:
 * - Loading  → skeleton rows inside UserTable
 * - Error    → error panel with retry inside UserTable
 * - Empty    → empty state illustration inside UserTable
 * - Success  → populated table with server-driven pagination
 *
 * Actions:
 * - Invite User (Dialog + form validation + loading state + auto-refetch)
 * - Row Actions: Edit, Activate, Deactivate, Suspend, Resend Invite
 */
export default function UserListPage() {
  const [inviteOpen, setInviteOpen] = useState(false)

  const {
    filters,
    page,
    pageSize,
    queryFilters,
    isDirty,
    onFiltersChange,
    onReset,
    onPageChange,
  } = useUsersFilters()

  const { data, isPending, isError, refetch } = useUsers(queryFilters)

  const users = data?.data ?? []
  const totalCount = data?.meta.total ?? 0

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Core · Users
          </p>
          {/*
           * h2 is intentional: the <h1> lives inside PortalHeader for this route.
           * This is the page-section heading within the main content area.
           */}
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground sm:text-2xl">
            User Accounts
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage system access, roles, and account status for your
            organisation.
          </p>
        </div>

        <Button
          id="invite-user-btn"
          onClick={() => setInviteOpen(true)}
          className="shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="size-4" aria-hidden />
          Invite User
        </Button>
      </header>

      <Separator />

      {/* ── Search & filters ──────────────────────────────────────────────── */}
      <UserFilters
        filters={filters}
        isDirty={isDirty}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
      />

      {/* ── User list / table ─────────────────────────────────────────────── */}
      <UserTable
        users={users}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        isPending={isPending}
        isError={isError}
        onPageChange={onPageChange}
        onRetry={() => void refetch()}
      />

      {/* ── Invite User Dialog ────────────────────────────────────────────── */}
      <UserInvitationDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
