export interface UserFormProps {
  className?: string
}

export function UserForm({ className }: UserFormProps) {
  return <section className={className} data-component="UserForm" />
}
