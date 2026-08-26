import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui";

export type EntitySummaryProps = React.ComponentProps<typeof Card> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
};

export function EntitySummary({
  title = "Summary",
  description,
  actions,
  footer,
  className,
  children,
  ...props
}: EntitySummaryProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)} {...props}>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="font-heading text-base">{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="py-5">{children}</CardContent>
      {footer ? (
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">{footer}</div>
      ) : null}
    </Card>
  );
}
