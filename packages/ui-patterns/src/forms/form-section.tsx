import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui";

export type FormSectionProps = React.ComponentProps<typeof Card> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
};

export function FormSection({
  title,
  description,
  actions,
  compact = false,
  className,
  children,
  ...props
}: FormSectionProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      {title || description || actions ? (
        <CardHeader className={cn("border-b", compact && "py-4")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              {title ? <CardTitle className="font-heading text-base">{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn(compact ? "py-4" : "py-5")}>{children}</CardContent>
    </Card>
  );
}
