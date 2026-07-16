export interface CareerCardProps {
  className?: string
}

export function CareerCard({ className }: CareerCardProps) {
  return <section className={className} data-component="CareerCard" />
}
