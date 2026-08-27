export interface EmployeeFormProps {
  className?: string;
}

export function EmployeeForm({ className }: EmployeeFormProps) {
  return <section className={className} data-component="EmployeeForm" />;
}
