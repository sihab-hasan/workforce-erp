import { SectionHeader } from "#components/shared/layout-elements/SectionHeader";

export interface AiInsightsSectionProps {
  className?: string;
}

export function AiInsightsSection() {
  return <SectionHeader title="AI Insights" align="left" />;
}
