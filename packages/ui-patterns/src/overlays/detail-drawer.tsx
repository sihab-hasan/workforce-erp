import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workforce-erp/ui/components/sheet";
import { cn } from "@workforce-erp/ui";

export type DetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "lg",
}: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("w-full", sizeClasses[size])}>
        <SheetHeader className="border-b pr-14">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <SheetFooter className="border-t">{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}
