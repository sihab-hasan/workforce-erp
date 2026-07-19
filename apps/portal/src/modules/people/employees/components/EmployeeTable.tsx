import { MapPin, Mail, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table"
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import { Button } from "@workforce-erp/ui/components/button"
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
import { EmployeeStatusBadge } from "@/modules/people/employees/components/EmployeeStatusBadge.tsx"
import type { Employee } from "@/modules/people/employees/types/employees.types.ts"

const EMPLOYMENT_TYPE_LABEL: Record<Employee["employmentType"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contractor: "Contractor",
  intern: "Intern",
}

function formatHireDate(iso: string): string {
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

export interface EmployeeTableProps {
  employees: Employee[]
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  className?: string
}

export function EmployeeTable({
  employees,
  page,
  pageSize,
  totalCount,
  onPageChange,
  className,
}: EmployeeTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)
  const pageNumbers = buildPageNumbers(page, totalPages)

  return (
    <section aria-label="Employee directory table" className={className}>
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            {totalCount === 0
              ? "No employees match your filters."
              : `Showing ${start}–${end} of ${totalCount} employee${totalCount !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>

        {/* ── Desktop table ───────────────────────────────────────── */}
        <CardContent className="hidden px-0 md:block">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No results found
              </p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hired</TableHead>
                  <TableHead className="pr-6 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    {/* ── Employee cell ── */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{emp.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {emp.name}
                          </p>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Mail className="size-3 shrink-0" aria-hidden />
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* ── Department ── */}
                    <TableCell>
                      <p className="text-sm text-foreground">
                        {emp.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.title}
                      </p>
                    </TableCell>

                    {/* ── Status ── */}
                    <TableCell>
                      <EmployeeStatusBadge status={emp.status} />
                    </TableCell>

                    {/* ── Type ── */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {EMPLOYMENT_TYPE_LABEL[emp.employmentType]}
                      </span>
                    </TableCell>

                    {/* ── Location ── */}
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3 shrink-0" aria-hidden />
                        {emp.location}
                      </span>
                    </TableCell>

                    {/* ── Hire date ── */}
                    <TableCell>
                      <time
                        dateTime={emp.hireDate}
                        className="text-sm text-muted-foreground"
                      >
                        {formatHireDate(emp.hireDate)}
                      </time>
                    </TableCell>

                    {/* ── Row action ── */}
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`View ${emp.name}'s profile`}
                      >
                        <ChevronRight className="size-4" aria-hidden />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* ── Mobile card list ─────────────────────────────────────── */}
        <CardContent className="px-0 md:hidden">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No results found
              </p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <ul role="list">
              {employees.map((emp, idx) => (
                <li key={emp.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center gap-3 px-6 py-4">
                    <Avatar>
                      <AvatarFallback>{emp.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {emp.name}
                        </p>
                        <EmployeeStatusBadge status={emp.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {emp.title} · {emp.department}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" aria-hidden />
                        {emp.location}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${emp.name}'s profile`}
                      className="shrink-0"
                    >
                      <ChevronRight className="size-4" aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>

        {/* ── Pagination footer ───────────────────────────────────── */}
        {totalPages > 1 && (
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
  )
}
