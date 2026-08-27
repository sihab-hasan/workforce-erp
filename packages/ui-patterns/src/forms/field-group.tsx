import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type FieldGroupProps = React.ComponentProps<"div"> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
};

export function FieldGroup({
  label,
  description,
  required,
  error,
  orientation = "vertical",
  className,
  children,
  ...props
}: FieldGroupProps) {
  return (
    <div
      className={cn(
        "min-w-0",
        orientation === "vertical"
          ? "space-y-1.5"
          : "grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-start",
        className,
      )}
      {...props}
    >
      {label || description ? (
        <div className="space-y-0.5">
          {label ? (
            <div className="text-sm font-medium leading-none">
              {label}
              {required ? (
                <span className="ml-1 text-destructive" aria-hidden="true">
                  *
                </span>
              ) : null}
            </div>
          ) : null}
          {description ? (
            <div className="text-xs leading-relaxed text-muted-foreground">{description}</div>
          ) : null}
        </div>
      ) : null}
      <div className="min-w-0 space-y-1.5">
        {children}
        {error ? (
          <div role="alert" className="text-xs font-medium text-destructive">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
