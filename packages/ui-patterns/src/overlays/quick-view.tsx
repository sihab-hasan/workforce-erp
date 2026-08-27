import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workforce-erp/ui/components/popover";
import { cn } from "@workforce-erp/ui";

export type QuickViewProps = {
  trigger: React.ReactElement;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
};

export function QuickView({
  trigger,
  title,
  description,
  children,
  footer,
  align = "end",
  className,
}: QuickViewProps) {
  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        align={align}
        className={cn("w-[min(28rem,calc(100vw-2rem))] p-0", className)}
      >
        {title || description ? (
          <PopoverHeader className="border-b px-4 py-3">
            {title ? <PopoverTitle>{title}</PopoverTitle> : null}
            {description ? <PopoverDescription>{description}</PopoverDescription> : null}
          </PopoverHeader>
        ) : null}
        <div className="max-h-[60vh] overflow-y-auto p-4">{children}</div>
        {footer ? <div className="border-t px-4 py-3">{footer}</div> : null}
      </PopoverContent>
    </Popover>
  );
}
