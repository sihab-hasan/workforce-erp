export interface BranchStatusBadgeProps {
  className?: string
}

export function BranchStatusBadge({ className }: BranchStatusBadgeProps) {
  return <section className={className} data-component="BranchStatusBadge" />
}
