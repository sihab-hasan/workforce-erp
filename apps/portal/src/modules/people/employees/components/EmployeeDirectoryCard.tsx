export interface EmployeeDirectoryCardProps {
  className?: string
}

export function EmployeeDirectoryCard({
  className,
}: EmployeeDirectoryCardProps) {
  return (
    <section className={className} data-component="EmployeeDirectoryCard" />
  )
}
