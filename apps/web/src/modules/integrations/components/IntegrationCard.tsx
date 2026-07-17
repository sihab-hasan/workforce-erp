export interface IntegrationCardProps {
  className?: string
}

export function IntegrationCard({ className }: IntegrationCardProps) {
  return <section className={className} data-component="IntegrationCard" />
}
