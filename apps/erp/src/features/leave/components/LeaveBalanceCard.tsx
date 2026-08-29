import { AlertCircle, Wallet } from "lucide-react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { ProgressIndicator, ProgressTrack } from "@workforce-erp/ui/components/progress";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { useLeaveOptionsQuery } from "../api/leave.queries";
import type { LeaveTypeBalance } from "../types/leave.types";

export interface LeaveBalanceCardProps {
  className?: string;
}

function formatDays(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function usageIndicator(type: LeaveTypeBalance): { width: number; className: string } {
  const allowance = Number(type.annual_allowance);
  const usedPercent = allowance > 0 ? Math.min(100, (Number(type.used) / allowance) * 100) : 0;

  if (Number(type.remaining) <= 0) {
    return { width: usedPercent, className: "bg-rose-500" };
  }
  if (usedPercent >= 75) {
    return { width: usedPercent, className: "bg-amber-500" };
  }
  return { width: usedPercent, className: "bg-emerald-500" };
}

function BalanceTile({ type }: { type: LeaveTypeBalance }) {
  const indicator = usageIndicator(type);

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{type.name}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{type.code}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {type.is_paid ? "Paid" : "Unpaid"}
        </Badge>
      </div>

      <p className="mt-3 text-2xl font-semibold">
        {formatDays(Number(type.remaining))}
        <span className="ml-1.5 text-sm font-normal text-muted-foreground">days left</span>
      </p>

      <ProgressTrack className="mt-3 h-2">
        <ProgressIndicator
          className={indicator.className}
          style={{ width: `${indicator.width}%` }}
        />
      </ProgressTrack>

      <p className="mt-2 text-xs text-muted-foreground">
        Used {formatDays(Number(type.used))} of {formatDays(Number(type.annual_allowance))} days
        this year
      </p>
    </div>
  );
}

export function LeaveBalanceCard({ className }: LeaveBalanceCardProps) {
  const { data, isPending, isError, refetch } = useLeaveOptionsQuery();
  const types = data?.data?.types ?? [];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Leave balances</CardTitle>
        <CardDescription className="text-xs">
          Remaining allowance per leave type for the current year.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <AlertCircle className="size-8 text-destructive" aria-hidden />
            <p className="text-sm font-medium">Failed to load leave balances</p>
            <p className="text-xs text-muted-foreground">
              An error occurred while communicating with the server.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-xl border p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        ) : types.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
            <Wallet className="size-8 stroke-[1.5]" aria-hidden />
            <p className="text-sm font-medium text-foreground">No active leave types</p>
            <p className="text-xs">Leave balances will appear once leave types are configured.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {types.map((type) => (
              <BalanceTile key={type.id} type={type} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
