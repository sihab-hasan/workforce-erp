import { Badge } from "@workforce-erp/ui/components/badge"
import type { EmploymentStatus } from "@/modules/people/employees/types/employees.types.ts"

const STATUS_CONFIG: Record<
  EmploymentStatus,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
  }
> = {
  active: { label: "Active", variant: "default" },
  "on-leave": { label: "On Leave", variant: "secondary" },
  probation: { label: "Probation", variant: "outline" },
  inactive: { label: "Inactive", variant: "destructive" },
}

export interface EmployeeStatusBadgeProps {
  status: EmploymentStatus
  className?: string
}

export function EmployeeStatusBadge({
  status,
  className,
}: EmployeeStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status]
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
