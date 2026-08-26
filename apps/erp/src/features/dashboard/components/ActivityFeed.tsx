import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { EmptyState } from "@workforce-erp/ui-patterns/feedback";

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
          <EmptyState
            title="No activity feed available"
            description="The current API does not expose organization activity, so this dashboard does not display fabricated events."
          />
        </CardContent>
      </Card>
    </section>
  );
}
