export interface DocumentGridProps {
  className?: string;
}

export function DocumentGrid({ className }: DocumentGridProps) {
  return <section className={className} data-component="DocumentGrid" />;
}
