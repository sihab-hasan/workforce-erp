export interface PermissionGroupProps {
  className?: string
}

export function PermissionGroup({ className }: PermissionGroupProps) {
  return <section className={className} data-component="PermissionGroup" />
}
