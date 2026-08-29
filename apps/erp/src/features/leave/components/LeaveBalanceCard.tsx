import { Calendar, Palmtree, Stethoscope, Umbrella } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Progress } from "@workforce-erp/ui/components/progress";
import { Badge } from "@workforce-erp/ui/components/badge";

export interface LeaveBalance {
  id: string;
  type: string;
  total: number;
  used: number;
  pending: number;
  color?: string;
}

export interface LeaveBalanceCardProps {
  balances?: LeaveBalance[];
  className?: string;
}

const DEFAULT_BALANCES: LeaveBalance[] = [
  { id: "annual", type: "Annual Leave", total: 18, used: 6, pending: 2 },
  { id: "sick", type: "Sick Leave", total: 10, used: 2, pending: 0 },
  { id: "casual", type: "Casual Leave", total: 6, used: 1, pending: 0 },
  { id: "unpaid", type: "Unpaid Leave", total: 10, used: 0, pending: 0 },
];

function getIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("annual") || t.includes("vacation")) return Palmtree;
  if (t.includes("sick") || t.includes("medical")) return Stethoscope;
  if (t.includes("casual")) return Umbrella;
  return Calendar;
}

export function LeaveBalanceCard({
  balances = DEFAULT_BALANCES,
  className,
}: LeaveBalanceCardProps) {
  return (
    <section aria-label="Leave Balances" className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((balance) => {
          const available = Math.max(0, balance.total - balance.used - balance.pending);
          const percentage = balance.total > 0 ? (balance.used / balance.total) * 100 : 0;
          const Icon = getIcon(balance.type);

          return (
            <Card key={balance.id} className="rounded-xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold">{balance.type}</CardTitle>
                  <CardDescription className="text-xs">
                    {balance.total} total days / yr
                  </CardDescription>
                </div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {available}{" "}
                    <span className="text-xs font-normal text-muted-foreground">days left</span>
                  </span>
                  {balance.pending > 0 && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      {balance.pending} pending
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <Progress value={percentage} className="h-1.5" />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{balance.used} days used</span>
                    <span>{balance.total - balance.used} available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
