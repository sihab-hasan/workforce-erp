import { SectionHeader } from "#components/shared/layout-elements/SectionHeader";

export interface BusinessOverviewSectionProps {
  className?: string;
}

export function BusinessOverviewSection() {
  return <SectionHeader title="Business Overview" align="left" />;
}
