import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workforce-erp/ui/components/item";
import { cn } from "@workforce-erp/ui";

export type SearchResultItem = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  category?: React.ReactNode;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  media?: React.ReactNode;
  action?: React.ReactNode;
  onSelect?: () => void;
};

export type SearchResultsProps = React.ComponentProps<"div"> & {
  items: SearchResultItem[];
  query?: string;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
  groupLabel?: React.ReactNode;
};

export function SearchResults({
  items,
  query,
  loading,
  emptyMessage,
  groupLabel,
  className,
  ...props
}: SearchResultsProps) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      {groupLabel ? (
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {groupLabel}
        </div>
      ) : null}
      {loading ? (
        <div className="p-6 text-center text-sm text-muted-foreground">Searching…</div>
      ) : items.length ? (
        <ItemGroup className="gap-1">
          {items.map((item) => (
            <Item
              key={item.id}
              size="sm"
              variant="default"
              className={cn("flex-nowrap", item.onSelect && "cursor-pointer hover:bg-muted")}
              role={item.onSelect ? "button" : undefined}
              tabIndex={item.onSelect ? 0 : undefined}
              onClick={item.onSelect}
              onKeyDown={
                item.onSelect
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        item.onSelect?.();
                      }
                    }
                  : undefined
              }
            >
              {item.media || item.icon ? (
                <ItemMedia variant={item.media ? "image" : "icon"}>
                  {item.media ?? item.icon}
                </ItemMedia>
              ) : null}
              <ItemContent>
                <ItemTitle>
                  {item.title}
                  {item.category ? <Badge variant="secondary">{item.category}</Badge> : null}
                </ItemTitle>
                {item.description ? <ItemDescription>{item.description}</ItemDescription> : null}
                {item.meta ? (
                  <div className="text-xs text-muted-foreground">{item.meta}</div>
                ) : null}
              </ItemContent>
              {item.action ? <ItemActions>{item.action}</ItemActions> : null}
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {emptyMessage ?? (query ? `No results for “${query}”.` : "Start typing to search.")}
        </div>
      )}
    </div>
  );
}
