import { SectionHeader } from "#components/shared/layout-elements/SectionHeader";

export interface ModuleShowcaseSectionProps {
  className?: string;
}

export function ModuleShowcaseSection() {
  return <SectionHeader title="Module Showcase" align="left" />;
}
