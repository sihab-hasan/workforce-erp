import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { useUsers } from "../hooks/use-users";
import { useUsersFilters } from "../hooks/use-users-filters";
import { UserFilters } from "../components/UserFilters";
import { UserTable } from "../components/UserTable";
import { UserInvitationDialog } from "../components/UserInvitationDialog";

/**
 * UserListPage
 *
 * Displays a paginated, filterable list of system user accounts.
 * Fetches live data from `GET /api/v1/users` via the useUsers hook.
 */
export default function UserListPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  const { filters, page, pageSize, queryFilters, isDirty, onFiltersChange, onReset, onPageChange } =
    useUsersFilters();

  const { data, isPending, isError, refetch } = useUsers(queryFilters);

  const users = data?.data ?? [];
  const totalCount = data?.meta.total ?? 0;

  return (
    <ErpPage
      title="Users"
      description="Manage system access, user roles, and account status for your organisation."
      actions={
        <Button
          id="invite-user-btn"
          onClick={() => setInviteOpen(true)}
          className="shrink-0 self-start sm:self-auto"
        >
          <UserPlus />
          Invite user
        </Button>
      }
    >
      <UserFilters
        filters={filters}
        isDirty={isDirty}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
      />

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

      <UserInvitationDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </ErpPage>
  );
}
