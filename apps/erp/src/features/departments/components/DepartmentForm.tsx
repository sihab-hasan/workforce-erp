export interface DepartmentFormProps {
  className?: string;
}

export function DepartmentForm({ className }: DepartmentFormProps) {
  return <section className={className} data-component="DepartmentForm" />;
}
