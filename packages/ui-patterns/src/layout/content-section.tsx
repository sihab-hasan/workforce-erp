import * as React from "react";
import { Separator } from "@workforce-erp/ui/components/separator";
import { cn } from "@workforce-erp/ui";

export type ContentSectionProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  divided?: boolean;
};

export function ContentSection({
  title,
  description,
  actions,
  divided = false,
  className,
  children,
  ...props
}: ContentSectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {title || description || actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {divided ? <Separator /> : null}
      <div>{children}</div>
    </section>
  );
}
