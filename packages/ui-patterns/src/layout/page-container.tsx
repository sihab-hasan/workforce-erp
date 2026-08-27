import * as React from "react";
import { cn } from "@workforce-erp/ui";

export type PageContainerProps = React.ComponentProps<"main"> & {
  size?: "full" | "wide" | "default" | "narrow";
  padded?: boolean;
};

const maxWidth = {
  full: "max-w-none",
  wide: "max-w-[96rem]",
  default: "max-w-[88rem]",
  narrow: "max-w-5xl",
};

export function PageContainer({
  size = "default",
  padded = true,
  className,
  ...props
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full",
        maxWidth[size],
        padded && "px-4 py-5 md:px-6 md:py-6 xl:px-8",
        className,
      )}
      {...props}
    />
  );
}
