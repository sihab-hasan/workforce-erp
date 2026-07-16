import { cn } from "@workforce-erp/ui/lib/utils"
import { Container } from "./container"

interface SectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  id?: string
}

export function Section({
  children,
  className,
  containerClassName,
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-20 lg:py-24", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}
