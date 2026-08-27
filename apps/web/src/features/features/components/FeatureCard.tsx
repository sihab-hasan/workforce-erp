export interface FeatureCardProps {
  className?: string;
}

export function FeatureCard({ className }: FeatureCardProps) {
  return <section className={className} data-component="FeatureCard" />;
}
