import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workforce-erp/ui/components/sheet";

export type FilterPanelProps = {
  title?: string;
  description?: string;
  trigger?: React.ReactElement;
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function FilterPanel({
  title = "Filters",
  description = "Narrow the result set using one or more criteria.",
  trigger,
  children,
  onApply,
  onReset,
  open,
  onOpenChange,
}: FilterPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <SheetTrigger render={trigger} />
      ) : (
        <SheetTrigger render={<Button variant="outline" size="sm" />}>Filters</SheetTrigger>
      )}
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-5">{children}</div>
        </div>
        {onApply || onReset ? (
          <SheetFooter className="border-t">
            {onReset ? (
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
            ) : null}
            {onApply ? <Button onClick={onApply}>Apply filters</Button> : null}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
