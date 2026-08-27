import { ChevronRight } from "lucide-react";

export interface AppBreadcrumbsProps {
  section: string;
  title: string;
}

export function AppBreadcrumbs({ section, title }: AppBreadcrumbsProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span className="truncate font-medium">{section}</span>
      <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate font-semibold text-primary">{title}</span>
    </div>
  );
}
