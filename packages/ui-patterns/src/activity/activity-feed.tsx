import * as React from "react";
import { cn } from "@workforce-erp/ui";
import { EmptyState } from "../feedback/empty-state";
import { ActivityItem, type ActivityItemProps } from "./activity-item";

export type ActivityFeedItem = Omit<ActivityItemProps, "isLast"> & { id: string };

export type ActivityFeedProps = React.ComponentProps<"div"> & {
  items: ActivityFeedItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export function ActivityFeed({
  items,
  emptyTitle = "No activity yet",
  emptyDescription = "Updates and changes will appear here.",
  header,
  footer,
  className,
  ...props
}: ActivityFeedProps) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      {header ? <div className="mb-4">{header}</div> : null}
      {items.length ? (
        <div role="feed" className="space-y-0">
          {items.map((item, index) => (
            <ActivityItem key={item.id} {...item} isLast={index === items.length - 1} />
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} className="min-h-52" />
      )}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}
