export interface ResourceCardProps {
  className?: string
}

export function ResourceCard({ className }: ResourceCardProps) {
  return <section className={className} data-component="ResourceCard" />
}
