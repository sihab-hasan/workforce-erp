export interface UserStatusBadgeProps {
  className?: string
}

export function UserStatusBadge({ className }: UserStatusBadgeProps) {
  return <section className={className} data-component="UserStatusBadge" />
}
