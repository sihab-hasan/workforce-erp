import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";

export type ChangeHistoryEntry = {
  id: string;
  field: string;
  previous?: React.ReactNode;
  current?: React.ReactNode;
  changedBy?: React.ReactNode;
  changedAt?: React.ReactNode;
  type?: "created" | "updated" | "removed";
};

export type ChangeHistoryProps = {
  entries: ChangeHistoryEntry[];
  emptyMessage?: string;
};

export function ChangeHistory({
  entries,
  emptyMessage = "No changes have been recorded.",
}: ChangeHistoryProps) {
  if (!entries.length)
    return (
      <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Changed by</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {entry.field}
                    {entry.type ? <Badge variant="secondary">{entry.type}</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-64 text-muted-foreground">
                  {entry.previous ?? "—"}
                </TableCell>
                <TableCell className="max-w-64">{entry.current ?? "—"}</TableCell>
                <TableCell>{entry.changedBy ?? "System"}</TableCell>
                <TableCell className="whitespace-nowrap text-right text-muted-foreground">
                  {entry.changedAt ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
