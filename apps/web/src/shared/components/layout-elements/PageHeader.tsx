import { Container } from "@/shell/container"
import { cn } from "@workforce-erp/ui/lib/utils"

type PageHeaderProps = {
  align?: "left" | "center"
  className?: string
  description?: string
  title: string
}

export function PageHeader({
  align = "center",
  className,
  description,
  title,
}: PageHeaderProps) {
  const isCenter = align === "center"

  return (
    <header className="py-10 md:py-14">
      <Container>
        <div
          className={cn(
            "mb-16 max-w-3xl",
            isCenter ? "mx-auto text-center" : "text-left",
            className
          )}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-8 h-1 w-24 rounded-full bg-primary",
              isCenter ? "mx-auto" : ""
            )}
          />
        </div>
      </Container>
    </header>
  )
}
