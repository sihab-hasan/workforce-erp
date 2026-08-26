export interface DepartmentTableProps {
  className?: string;
}

export function DepartmentTable({ className }: DepartmentTableProps) {
  return <section className={className} data-component="DepartmentTable" />;
}
