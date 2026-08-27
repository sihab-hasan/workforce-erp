import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workforce-erp/ui/components/tabs";
import { Badge } from "@workforce-erp/ui/components/badge";
import { cn } from "@workforce-erp/ui";

export type EntityTab = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  count?: number;
  disabled?: boolean;
};

export type EntityTabsProps = Omit<React.ComponentProps<typeof Tabs>, "children"> & {
  tabs: EntityTab[];
};

export function EntityTabs({ tabs, className, ...props }: EntityTabsProps) {
  return (
    <Tabs className={cn("w-full", className)} {...props}>
      <TabsList
        variant="line"
        className="w-full justify-start overflow-x-auto rounded-none border-b p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="flex-none rounded-none px-3 pb-2.5"
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                {tab.count}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-5">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
