import { ChevronRight } from "lucide-react"

type BreadcrumbsProps = {
  section: string
  title: string
}

export function Breadcrumbs({ section, title }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
      <span className="font-medium">{section}</span>
      <ChevronRight className="size-3 shrink-0" />
      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
        {title}
      </span>
    </div>
  )
}
