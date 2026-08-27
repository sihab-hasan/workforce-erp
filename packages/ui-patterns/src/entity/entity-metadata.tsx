import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type EntityMetadataItem = {
  id?: string;
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
};

export type EntityMetadataProps = React.ComponentProps<"dl"> & {
  items: EntityMetadataItem[];
  columns?: 1 | 2 | 3 | 4;
  compact?: boolean;
};

const columnsMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function EntityMetadata({
  items,
  columns = 3,
  compact = false,
  className,
  ...props
}: EntityMetadataProps) {
  return (
    <dl
      className={cn(
        "grid",
        columnsMap[columns],
        compact ? "gap-x-4 gap-y-3" : "gap-x-6 gap-y-5",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div key={item.id ?? index} className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 min-w-0 break-words text-sm font-medium text-foreground">
            {item.value}
          </dd>
          {item.hint ? (
            <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.hint}</div>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
