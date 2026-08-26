import { SectionHeader } from "#components/shared/layout-elements/SectionHeader";

export interface AutomationSectionProps {
  className?: string;
}

export function AutomationSection() {
  return <SectionHeader title="Automation" align="left" />;
}
