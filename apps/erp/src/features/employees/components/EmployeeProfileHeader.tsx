export interface EmployeeProfileHeaderProps {
  className?: string;
}

export function EmployeeProfileHeader({ className }: EmployeeProfileHeaderProps) {
  return <section className={className} data-component="EmployeeProfileHeader" />;
}
