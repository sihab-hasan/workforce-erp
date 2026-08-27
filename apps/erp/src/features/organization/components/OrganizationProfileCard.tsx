export interface OrganizationProfileCardProps {
  className?: string;
}

export function OrganizationProfileCard({ className }: OrganizationProfileCardProps) {
  return <section className={className} data-component="OrganizationProfileCard" />;
}
