export interface AttendanceMethodBadgeProps {
  className?: string
}

export function AttendanceMethodBadge({
  className,
}: AttendanceMethodBadgeProps) {
  return (
    <section className={className} data-component="AttendanceMethodBadge" />
  )
}
