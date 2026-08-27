import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workforce-erp/ui/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui";
import { EntityStatus, type EntityStatusTone } from "../entity/entity-status";

export type ApprovalRouteStep = {
  id: string;
  name: React.ReactNode;
  role?: React.ReactNode;
  avatarUrl?: string;
  initials?: string;
  status?: React.ReactNode;
  tone?: EntityStatusTone;
  timestamp?: React.ReactNode;
  note?: React.ReactNode;
};

export type ApprovalRouteProps = React.ComponentProps<typeof Card> & {
  steps: ApprovalRouteStep[];
  title?: React.ReactNode;
  direction?: "horizontal" | "vertical";
};

export function ApprovalRoute({
  steps,
  title = "Approval route",
  direction = "vertical",
  className,
  ...props
}: ApprovalRouteProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="border-b">
        <CardTitle className="font-heading text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn("py-5", direction === "horizontal" && "overflow-x-auto")}>
        <ol
          className={cn(
            direction === "vertical" ? "space-y-0" : "flex min-w-max items-start gap-3",
          )}
        >
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "relative",
                direction === "vertical"
                  ? "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
                  : "w-56",
              )}
            >
              {direction === "vertical" && index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-5 top-10 bottom-0 w-px bg-border"
                />
              ) : null}
              <Avatar className="relative z-10 size-10 shrink-0 border bg-background">
                {step.avatarUrl ? <AvatarImage src={step.avatarUrl} alt="" /> : null}
                <AvatarFallback>{step.initials ?? String(index + 1)}</AvatarFallback>
              </Avatar>
              <div className={cn("min-w-0", direction === "horizontal" && "mt-2")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{step.name}</span>
                  {step.status ? (
                    <EntityStatus tone={step.tone ?? "neutral"}>{step.status}</EntityStatus>
                  ) : null}
                </div>
                {step.role ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">{step.role}</div>
                ) : null}
                {step.timestamp ? (
                  <div className="mt-1 text-xs text-muted-foreground">{step.timestamp}</div>
                ) : null}
                {step.note ? (
                  <div className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    {step.note}
                  </div>
                ) : null}
              </div>
              {direction === "horizontal" && index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[10rem] top-5 h-px w-[4rem] bg-border"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
