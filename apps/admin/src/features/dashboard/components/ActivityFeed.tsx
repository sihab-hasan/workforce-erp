import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";

export interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  return (
    <section aria-label="Recent activity" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Activity will appear here when an activity endpoint is available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Empty className="min-h-48 border-0 p-6">
            <EmptyHeader>
              <EmptyTitle>No activity feed available</EmptyTitle>
              <EmptyDescription>
                The current API does not expose organization activity, so this dashboard does not
                display fabricated events.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </section>
  );
}
