import { Building2, Edit, MoreHorizontal, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import type { Department } from "../types/departments.types";

export interface DepartmentTableProps {
  departments?: Department[];
  onEdit?: (department: Department) => void;
  onDelete?: (departmentId: string) => void;
  className?: string;
}

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "DEP-01",
    name: "Engineering & Technology",
    code: "ENG",
    branch_name: "Dhaka HQ",
    head_of_department: "Devon Lane",
    employee_count: 24,
    status: "active",
    created_at: "2024-01-10",
  },
  {
    id: "DEP-02",
    name: "Sales & Marketing",
    code: "MKT",
    branch_name: "Dhaka HQ",
    head_of_department: "Jane Cooper",
    employee_count: 14,
    status: "active",
    created_at: "2024-01-10",
  },
  {
    id: "DEP-03",
    name: "Human Resources",
    code: "HR",
    branch_name: "Dhaka HQ",
    head_of_department: "Courtney Henry",
    employee_count: 6,
    status: "active",
    created_at: "2024-01-15",
  },
  {
    id: "DEP-04",
    name: "Finance & Accounting",
    code: "FIN",
    branch_name: "Dhaka HQ",
    head_of_department: "Robert Fox",
    employee_count: 8,
    status: "active",
    created_at: "2024-02-01",
  },
];

export function DepartmentTable({
  departments = DEFAULT_DEPARTMENTS,
  onEdit,
  onDelete,
  className,
}: DepartmentTableProps) {
  return (
    <div className={className}>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Branch / Location</TableHead>
              <TableHead>Head of Department</TableHead>
              <TableHead>Headcount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No departments created yet.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="size-4" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">{dept.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                      {dept.code}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {dept.branch_name || "Primary Branch"}
                  </TableCell>

                  <TableCell className="text-sm font-medium text-foreground">
                    {dept.head_of_department || "Not assigned"}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="size-3.5 text-muted-foreground" />
                      <span className="font-medium">{dept.employee_count}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        dept.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {dept.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Manage Unit</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit?.(dept)}>
                          <Edit className="mr-2 size-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(dept.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" /> Delete Unit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
