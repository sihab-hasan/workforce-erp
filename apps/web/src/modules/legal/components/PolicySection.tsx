export interface PolicySectionProps {
  className?: string
}

export function PolicySection({ className }: PolicySectionProps) {
  return <section className={className} data-component="PolicySection" />
}
