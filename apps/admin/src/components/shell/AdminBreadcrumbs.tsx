import { ChevronRight } from "lucide-react";

export function AdminBreadcrumbs({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-medium">Platform</span>
      <ChevronRight className="size-3.5" aria-hidden="true" />
      <span className="font-semibold text-primary">{title}</span>
    </div>
  );
}
