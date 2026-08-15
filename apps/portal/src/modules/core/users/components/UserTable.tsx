import { useState } from "react"
import {
  AlertCircle,
  Mail,
  Users,
  Building2,
  UserCheck,
  Shield,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table"
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar"
import { Badge } from "@workforce-erp/ui/components/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import { Button } from "@workforce-erp/ui/components/button"
import { Skeleton } from "@workforce-erp/ui/components/skeleton"
import { Separator } from "@workforce-erp/ui/components/separator"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workforce-erp/ui/components/pagination"
import { UserStatusBadge } from "./UserStatusBadge"
import { UserActionsMenu } from "./UserActionsMenu"
import { UserEditDialog } from "./UserEditDialog"
import type { UserSummary, UserRole } from "../types/users.types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  readonly: "Read-only",
}

const ROLE_BADGE_STYLE: Record<
  UserRole,
  { variant: "default" | "secondary" | "outline"; className?: string }
> = {
  owner: {
    variant: "default",
    className: "bg-primary text-primary-foreground font-semibold",
  },
  admin: {
    variant: "default",
    className: "bg-indigo-600 text-white dark:bg-indigo-500",
  },
  manager: { variant: "secondary", className: "font-medium" },
  staff: { variant: "outline", className: "text-muted-foreground" },
  readonly: {
    variant: "outline",
    className: "text-muted-foreground/80 border-dashed",
  },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never"
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}

// ---------------------------------------------------------------------------
// Sub-components: loading skeleton rows
// ---------------------------------------------------------------------------

function UserTableSkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} aria-hidden>
          {/* User cell */}
          <TableCell className="pl-6">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-3 w-44 rounded" />
              </div>
            </div>
          </TableCell>
          {/* Role */}
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          {/* Organization */}
          <TableCell>
            <Skeleton className="h-3.5 w-28 rounded" />
          </TableCell>
          {/* Status */}
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          {/* Last login */}
          <TableCell>
            <Skeleton className="h-3.5 w-24 rounded" />
          </TableCell>
          {/* Joined */}
          <TableCell>
            <Skeleton className="h-3.5 w-24 rounded" />
          </TableCell>
          {/* Action */}
          <TableCell className="pr-6 text-right">
            <Skeleton className="ml-auto size-7 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: empty state
// ---------------------------------------------------------------------------

function UserTableEmpty() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 py-20 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Users className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No users found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: error state
// ---------------------------------------------------------------------------

function UserTableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-20 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Failed to load users
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Something went wrong while fetching user accounts.
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile card list items
// ---------------------------------------------------------------------------

function UserMobileCard({
  user,
  isFirst,
  onEdit,
}: {
  user: UserSummary
  isFirst: boolean
  onEdit: (user: UserSummary) => void
}) {
  const roleStyle = ROLE_BADGE_STYLE[user.role]

  return (
    <li>
      {!isFirst && <Separator />}
      <div className="flex items-center gap-3 px-6 py-4">
        <Avatar>
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <UserStatusBadge status={user.status} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Badge
              variant={roleStyle.variant}
              className={`text-[11px] ${roleStyle.className ?? ""}`}
            >
              {ROLE_LABEL[user.role]}
            </Badge>
            <span className="text-muted-foreground/60">·</span>
            <span className="flex items-center gap-1 truncate text-muted-foreground">
              <Building2 className="size-3 shrink-0" aria-hidden />
              {user.organization_name || "Default Org"}
            </span>
          </div>

          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Mail className="size-3 shrink-0" aria-hidden />
            {user.email}
          </p>

          {user.employee_id && (
            <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-3 shrink-0" aria-hidden />
              <span>Linked Employee</span>
            </p>
          )}
        </div>
        <div className="shrink-0">
          <UserActionsMenu user={user} onEdit={onEdit} />
        </div>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface UserTableProps {
  users: UserSummary[]
  page: number
  pageSize: number
  totalCount: number
  isPending: boolean
  isError: boolean
  onPageChange: (page: number) => void
  onRetry?: () => void
  className?: string
}

export function UserTable({
  users,
  page,
  pageSize,
  totalCount,
  isPending,
  isError,
  onPageChange,
  onRetry,
  className,
}: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)
  const pageNumbers = buildPageNumbers(page, totalPages)

  // Resolved description for the card
  const cardDescription = isPending
    ? "Loading user accounts…"
    : isError
      ? "Could not load users."
      : totalCount === 0
        ? "No users match your filters."
        : `Showing ${start}–${end} of ${totalCount} user${totalCount !== 1 ? "s" : ""}`

  return (
    <>
      <section aria-label="User accounts table" className={className}>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </CardHeader>

          {/* ── Desktop table ─────────────────────────────────────────── */}
          <CardContent className="hidden px-0 md:block">
            {isError ? (
              <UserTableError onRetry={onRetry} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    <UserTableSkeletonRows count={pageSize} />
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <UserTableEmpty />
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const roleStyle = ROLE_BADGE_STYLE[user.role]
                      return (
                        <TableRow key={user.id}>
                          {/* ── User cell ── */}
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {user.name}
                                  </p>
                                  {user.employee_id && (
                                    <span
                                      title="Linked to staff employee profile"
                                      className="py-0.2 inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                                    >
                                      <UserCheck
                                        className="size-2.5"
                                        aria-hidden
                                      />
                                      Employee
                                    </span>
                                  )}
                                </div>
                                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <Mail
                                    className="size-3 shrink-0"
                                    aria-hidden
                                  />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* ── Role ── */}
                          <TableCell>
                            <Badge
                              variant={roleStyle.variant}
                              className={`gap-1 ${roleStyle.className ?? ""}`}
                            >
                              <Shield className="size-3" aria-hidden />
                              <span>{ROLE_LABEL[user.role]}</span>
                            </Badge>
                          </TableCell>

                          {/* ── Organization ── */}
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <Building2
                                className="size-3.5 shrink-0 text-muted-foreground"
                                aria-hidden
                              />
                              <span className="truncate">
                                {user.organization_name ||
                                  "Default Organization"}
                              </span>
                            </div>
                          </TableCell>

                          {/* ── Status ── */}
                          <TableCell>
                            <UserStatusBadge status={user.status} />
                          </TableCell>

                          {/* ── Last login ── */}
                          <TableCell>
                            <time
                              dateTime={user.last_login_at ?? undefined}
                              className="text-sm text-muted-foreground"
                            >
                              {formatDate(user.last_login_at)}
                            </time>
                          </TableCell>

                          {/* ── Joined (created_at) ── */}
                          <TableCell>
                            <time
                              dateTime={user.created_at}
                              className="text-sm text-muted-foreground"
                            >
                              {formatDate(user.created_at)}
                            </time>
                          </TableCell>

                          {/* ── Row actions menu ── */}
                          <TableCell className="pr-6 text-right">
                            <UserActionsMenu
                              user={user}
                              onEdit={(u) => setEditingUser(u)}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* ── Mobile card list ──────────────────────────────────────── */}
          <CardContent className="px-0 md:hidden">
            {isError ? (
              <UserTableError onRetry={onRetry} />
            ) : isPending ? (
              <div className="space-y-0" aria-busy aria-label="Loading users">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center gap-3 px-6 py-4">
                      <Skeleton className="size-10 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-3.5 w-28 rounded" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-36 rounded" />
                        <Skeleton className="h-3 w-44 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <UserTableEmpty />
            ) : (
              <ul role="list">
                {users.map((user, idx) => (
                  <UserMobileCard
                    key={user.id}
                    user={user}
                    isFirst={idx === 0}
                    onEdit={(u) => setEditingUser(u)}
                  />
                ))}
              </ul>
            )}
          </CardContent>

          {/* ── Pagination footer ─────────────────────────────────────── */}
          {!isPending && !isError && totalPages > 1 && (
            <>
              <Separator />
              <CardFooter className="justify-between gap-4 py-4">
                <p className="shrink-0 text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <Pagination className="w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) onPageChange(page - 1)
                        }}
                        aria-disabled={page <= 1}
                        className={
                          page <= 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>

                    {pageNumbers.map((num, idx) =>
                      num === "…" ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={num}>
                          <PaginationLink
                            href="#"
                            isActive={num === page}
                            onClick={(e) => {
                              e.preventDefault()
                              onPageChange(num)
                            }}
                          >
                            {num}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) onPageChange(page + 1)
                        }}
                        aria-disabled={page >= totalPages}
                        className={
                          page >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            </>
          )}
        </Card>
      </section>

      {/* Edit User Dialog */}
      <UserEditDialog
        user={editingUser}
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
      />
    </>
  )
}
