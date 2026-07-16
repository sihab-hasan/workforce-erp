export interface ResourceGridProps {
  className?: string
}

export function ResourceGrid({ className }: ResourceGridProps) {
  return <section className={className} data-component="ResourceGrid" />
}
