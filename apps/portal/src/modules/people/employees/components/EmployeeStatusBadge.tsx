export interface EmployeeStatusBadgeProps {
  className?: string
}

export function EmployeeStatusBadge({ className }: EmployeeStatusBadgeProps) {
  return <section className={className} data-component="EmployeeStatusBadge" />
}
