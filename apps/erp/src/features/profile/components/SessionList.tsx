export interface SessionListProps {
  className?: string;
}

export function SessionList({ className }: SessionListProps) {
  return <section className={className} data-component="SessionList" />;
}
