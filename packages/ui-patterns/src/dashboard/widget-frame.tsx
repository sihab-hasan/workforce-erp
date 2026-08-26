import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui";

export type WidgetFrameProps = React.ComponentProps<typeof Card> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean;
  loading?: boolean;
};

export function WidgetFrame({
  title,
  description,
  actions,
  footer,
  flush = false,
  loading = false,
  className,
  children,
  ...props
}: WidgetFrameProps) {
  return (
    <Card
      aria-busy={loading || undefined}
      className={cn("min-w-0 overflow-hidden", className)}
      {...props}
    >
      {title || description || actions ? (
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? <CardTitle className="font-heading text-base">{title}</CardTitle> : null}
              {description ? (
                <CardDescription className="mt-1">{description}</CardDescription>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn(flush && "p-0", !flush && "py-5")}>{children}</CardContent>
      {footer ? (
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">{footer}</div>
      ) : null}
    </Card>
  );
}
