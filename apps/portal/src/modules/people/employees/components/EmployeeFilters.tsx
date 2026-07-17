export interface EmployeeFiltersProps {
  className?: string
}

export function EmployeeFilters({ className }: EmployeeFiltersProps) {
  return <section className={className} data-component="EmployeeFilters" />
}
