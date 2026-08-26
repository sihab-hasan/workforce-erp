import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workforce-erp/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workforce-erp/ui/components/collapsible";

export type ReportFiltersProps = {
  children: React.ReactNode;
  title?: string;
  onRun?: () => void;
  onReset?: () => void;
  running?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function ReportFilters({
  children,
  title = "Report parameters",
  onRun,
  onReset,
  running,
  collapsible = false,
  defaultOpen = true,
}: ReportFiltersProps) {
  const content = (
    <>
      <CardContent className="py-5">{children}</CardContent>
      {onRun || onReset ? (
        <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3">
          {onReset ? (
            <Button variant="outline" onClick={onReset} disabled={running}>
              Reset
            </Button>
          ) : null}
          {onRun ? (
            <Button onClick={onRun} disabled={running}>
              {running ? "Running…" : "Run report"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (!collapsible) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-heading text-base">{title}</CardTitle>
        </CardHeader>
        {content}
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible defaultOpen={defaultOpen}>
        <CardHeader className="border-b">
          <CollapsibleTrigger
            render={
              <Button variant="ghost" className="h-auto w-full justify-between p-0 text-left" />
            }
          >
            <CardTitle className="font-heading text-base">{title}</CardTitle>
            <span aria-hidden="true">⌄</span>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>{content}</CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
