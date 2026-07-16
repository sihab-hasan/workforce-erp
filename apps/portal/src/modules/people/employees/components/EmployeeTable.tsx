export interface EmployeeTableProps {
  className?: string
}

export function EmployeeTable({ className }: EmployeeTableProps) {
  return <section className={className} data-component="EmployeeTable" />
}
