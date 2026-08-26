export interface DocumentTableProps {
  className?: string;
}

export function DocumentTable({ className }: DocumentTableProps) {
  return <section className={className} data-component="DocumentTable" />;
}
