export interface ResourceFilterProps {
  className?: string
}

export function ResourceFilter({ className }: ResourceFilterProps) {
  return <section className={className} data-component="ResourceFilter" />
}
