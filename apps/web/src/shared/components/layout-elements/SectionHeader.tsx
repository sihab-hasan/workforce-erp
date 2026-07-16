import { Section } from "@/shell/section"
import { cn } from "@workforce-erp/ui/lib/utils"

type SectionHeaderProps = {
  align?: "left" | "center"
  className?: string
  id?: string
  subtitle?: string
  title: string
}

export function SectionHeader({
  align = "center",
  className,
  id,
  subtitle,
  title,
}: SectionHeaderProps) {
  const isCenter = align === "center"

  return (
    <Section id={id} className="py-10 md:py-12">
      <div
        className={cn(
          "mb-10 max-w-2xl space-y-3",
          isCenter ? "mx-auto text-center" : "text-left",
          className
        )}
      >
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {title}
        </h2>

        {subtitle ? (
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </Section>
  )
}
