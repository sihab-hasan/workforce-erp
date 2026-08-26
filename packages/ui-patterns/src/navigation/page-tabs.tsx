import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@workforce-erp/ui/components/tabs";
import { cn } from "@workforce-erp/ui";

export type PageTab = {
  value: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
};

export type PageTabsProps = Omit<React.ComponentProps<typeof Tabs>, "children"> & {
  tabs: PageTab[];
  listClassName?: string;
};

export function PageTabs({ tabs, listClassName, className, ...props }: PageTabsProps) {
  return (
    <Tabs className={cn("w-full", className)} {...props}>
      <TabsList
        variant="line"
        className={cn(
          "w-full justify-start overflow-x-auto rounded-none border-b p-0",
          listClassName,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="flex-none rounded-none px-2.5 pb-2.5"
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5">
                {tab.count}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
