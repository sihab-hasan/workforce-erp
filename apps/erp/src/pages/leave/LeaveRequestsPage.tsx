import { useEffect, useState } from "react";
import { History, Plus, Search, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select";
import { ErpPage } from "#components/erp/ErpPage";
import { useLeaveListQuery } from "#features/leave/api/leave.queries";
import { LeaveBalanceCard } from "#features/leave/components/LeaveBalanceCard";
import { LeaveTable } from "#features/leave/components/LeaveTable";
import { useLeaveFilters } from "#features/leave/hooks/use-leave-filters";
import type { LeaveStatus } from "#features/leave/types/leave.types";
import { companyRoutes } from "#routes/paths";

export default function LeaveRequestsPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const { page, pageSize, status, search, filters, setPage, setStatus, setSearch, resetFilters } =
    useLeaveFilters();
  const [searchInput, setSearchInput] = useState(search);
  const query = useLeaveListQuery(filters);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const isFiltered = status !== "all" || Boolean(search);

  const leaves = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const lastPage = Math.max(1, query.data?.meta.lastPage ?? 1);

  return (
    <ErpPage
      title="Leave requests"
      description="Submit, review and track employee leave inside the selected company."
      actions={
        <>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.leaveHistory(tenantKey, companyKey)} />}
          >
            <History />
            My Leave
          </Button>
          <Button
            nativeButton={false}
            render={<Link to={companyRoutes.leaveCreate(tenantKey, companyKey)} />}
          >
            <Plus />
            Request leave
          </Button>
        </>
      }
    >
      <LeaveBalanceCard />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employee by name or ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </form>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(val) => setStatus(val as LeaveStatus | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                resetFilters();
              }}
              title="Reset filters"
            >
              <X className="mr-1 size-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <LeaveTable
        leaves={leaves}
        isPending={query.isPending}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        page={page}
        pageSize={pageSize}
        total={total}
        lastPage={lastPage}
        onPageChange={setPage}
      />
    </ErpPage>
  );
}
