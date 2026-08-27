import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import type { DataTableColumn } from "./data-table.types";

export type DataTableColumnToggleProps<TData> = {
  columns: DataTableColumn<TData>[];
  visibleColumnIds: Set<string>;
  onVisibilityChange: (columnId: string, visible: boolean) => void;
  label?: string;
};

export function DataTableColumnToggle<TData>({
  columns,
  visibleColumnIds,
  onVisibilityChange,
  label = "Columns",
}: DataTableColumnToggleProps<TData>) {
  const hideable = columns.filter((column) => column.hideable !== false);
  if (!hideable.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumnIds.has(column.id)}
            onCheckedChange={(checked) => onVisibilityChange(column.id, checked === true)}
          >
            {typeof column.header === "string" ? column.header : column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
