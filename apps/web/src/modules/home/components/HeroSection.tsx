import { SectionHeader } from "@/shared/components/layout-elements/SectionHeader"

export interface HeroSectionProps {
  className?: string
}

export function HeroSection() {
  return <SectionHeader title="Hero" align="left" />
}
