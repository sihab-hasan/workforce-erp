import * as React from "react";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Spinner } from "@workforce-erp/ui/components/spinner";
import { cn } from "@workforce-erp/ui";

export type LoadingStateProps = React.ComponentProps<"div"> & {
  label?: string;
  variant?: "spinner" | "skeleton";
  lines?: number;
};

export function LoadingState({
  label = "Loading…",
  variant = "spinner",
  lines = 5,
  className,
  ...props
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div
        aria-busy="true"
        aria-label={label}
        className={cn("space-y-3 rounded-2xl border p-5", className)}
        {...props}
      >
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className={cn("h-4", index % 3 === 0 ? "w-5/6" : "w-full")} />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-busy="true"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Spinner className="size-5" />
      <span>{label}</span>
    </div>
  );
}
