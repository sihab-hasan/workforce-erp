import { Clock3, ShieldCheck, UserPlus, Users } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";

export interface AdminAccountMetrics {
  total: number;
  active: number;
  invited: number;
  suspended: number;
}

export function KpiGrid({
  metrics,
  loading = false,
  className,
}: {
  metrics?: AdminAccountMetrics;
  loading?: boolean;
  className?: string;
}) {
  const items = [
    { label: "Users", value: metrics?.total ?? 0, caption: "Visible user accounts", icon: Users },
    {
      label: "Active",
      value: metrics?.active ?? 0,
      caption: "Accounts with active access",
      icon: ShieldCheck,
    },
    {
      label: "Invited",
      value: metrics?.invited ?? 0,
      caption: "Invitations awaiting activation",
      icon: UserPlus,
    },
    {
      label: "Suspended",
      value: metrics?.suspended ?? 0,
      caption: "Temporarily suspended accounts",
      icon: Clock3,
    },
  ] as const;

  return (
    <section aria-label="Platform account indicators" className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} size="sm" className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.caption}</CardDescription>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
                    <Icon aria-hidden="true" />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <p className="font-heading text-3xl font-semibold tabular-nums">
                    {item.value.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
