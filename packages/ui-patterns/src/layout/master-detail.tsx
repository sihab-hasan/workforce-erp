import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type MasterDetailProps = React.ComponentProps<"div"> & {
  master: React.ReactNode;
  detail: React.ReactNode;
  masterWidth?: "sm" | "md" | "lg";
  collapseAt?: "md" | "lg" | "xl";
};

const widths = { sm: "22rem", md: "28rem", lg: "34rem" };
const collapse = {
  md: "md:grid",
  lg: "lg:grid",
  xl: "xl:grid",
};

export function MasterDetail({
  master,
  detail,
  masterWidth = "md",
  collapseAt = "lg",
  className,
  ...props
}: MasterDetailProps) {
  return (
    <div
      className={cn("min-h-0 gap-4", collapse[collapseAt], className)}
      style={{ gridTemplateColumns: `${widths[masterWidth]} minmax(0,1fr)` }}
      {...props}
    >
      <aside className="min-h-0 overflow-hidden rounded-2xl border bg-card">{master}</aside>
      <section className="mt-4 min-h-0 min-w-0 overflow-hidden rounded-2xl border bg-card md:mt-0">
        {detail}
      </section>
    </div>
  );
}
