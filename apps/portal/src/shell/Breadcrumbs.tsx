import { ChevronRight } from "lucide-react"

type BreadcrumbsProps = {
  section: string
  title: string
}

export function Breadcrumbs({ section, title }: BreadcrumbsProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span className="truncate font-medium">{section}</span>
      <ChevronRight className="shrink-0" aria-hidden />
      <span className="font-semibold text-primary">{title}</span>
    </div>
  )
}
