export interface AttendanceTableProps {
  className?: string
}

export function AttendanceTable({ className }: AttendanceTableProps) {
  return <section className={className} data-component="AttendanceTable" />
}
