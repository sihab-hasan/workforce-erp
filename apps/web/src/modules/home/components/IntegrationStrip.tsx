import { SectionHeader } from "@/shared/components/layout-elements/SectionHeader"

export interface IntegrationStripProps {
  className?: string
}

export function IntegrationStrip() {
  return <SectionHeader title="Integrations" align="left" />
}
