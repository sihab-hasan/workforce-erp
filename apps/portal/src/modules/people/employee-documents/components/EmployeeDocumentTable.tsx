export interface EmployeeDocumentTableProps {
  className?: string
}

export function EmployeeDocumentTable({
  className,
}: EmployeeDocumentTableProps) {
  return (
    <section className={className} data-component="EmployeeDocumentTable" />
  )
}
