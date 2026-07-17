export interface EmployeeStatisticsProps {
  className?: string
}

export function EmployeeStatistics({ className }: EmployeeStatisticsProps) {
  return <section className={className} data-component="EmployeeStatistics" />
}
