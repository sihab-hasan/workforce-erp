export interface UserTableProps {
  className?: string
}

export function UserTable({ className }: UserTableProps) {
  return <section className={className} data-component="UserTable" />
}
