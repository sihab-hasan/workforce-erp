type BreadcrumbsProps = {
  section: string
  title: string
}

export function Breadcrumbs({ section, title }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span>{section}</span>
      <span>/</span>
      <span className="font-medium text-slate-900 dark:text-slate-100">
        {title}
      </span>
    </div>
  )
}
