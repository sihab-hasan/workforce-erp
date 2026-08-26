import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { cn } from "@workforce-erp/ui";

export type SectionNavigationItem = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
};

export type SectionNavigationProps = React.ComponentProps<"nav"> & {
  items: SectionNavigationItem[];
  value?: string;
  onValueChange?: (id: string) => void;
};

export function SectionNavigation({
  items,
  value,
  onValueChange,
  className,
  ...props
}: SectionNavigationProps) {
  return (
    <nav aria-label="Section navigation" className={cn("space-y-1", className)} {...props}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            aria-current={active ? "page" : undefined}
            onClick={() => onValueChange?.(item.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
              active
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate", active && "font-medium")}>{item.label}</span>
              {item.description ? (
                <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </span>
            {item.badge ? (
              <Badge variant="secondary" className="shrink-0">
                {item.badge}
              </Badge>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
