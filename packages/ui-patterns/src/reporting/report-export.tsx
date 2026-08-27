import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";

export type ReportExportFormat = "csv" | "xlsx" | "pdf" | "print" | string;
export type ReportExportOption = {
  id: ReportExportFormat;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

export type ReportExportProps = {
  options?: ReportExportOption[];
  onExport: (format: ReportExportFormat) => void;
  disabled?: boolean;
  pendingFormat?: ReportExportFormat | null;
};

const defaults: ReportExportOption[] = [
  { id: "csv", label: "CSV", description: "Raw tabular data" },
  { id: "xlsx", label: "Excel", description: "Formatted workbook" },
  { id: "pdf", label: "PDF", description: "Presentation-ready report" },
  { id: "print", label: "Print", description: "Open print layout" },
];

export function ReportExport({
  options = defaults,
  onExport,
  disabled,
  pendingFormat,
}: ReportExportProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" disabled={disabled} />}>
        {pendingFormat ? "Exporting…" : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Export report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            disabled={option.disabled || Boolean(pendingFormat)}
            onClick={() => onExport(option.id)}
          >
            <div className="min-w-0">
              <div className="font-medium">{option.label}</div>
              {option.description ? (
                <div className="text-xs text-muted-foreground">{option.description}</div>
              ) : null}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
