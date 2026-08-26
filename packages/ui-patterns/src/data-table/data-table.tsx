import { Checkbox } from "@workforce-erp/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";
import { Button } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui";
import { DataTableEmpty } from "./data-table-empty";
import { DataTableLoading } from "./data-table-loading";
import type { DataTableProps, DataTableSort } from "./data-table.types";

function nextSort(
  current: DataTableSort | null | undefined,
  columnId: string,
): DataTableSort | null {
  if (!current || current.columnId !== columnId) return { columnId, direction: "asc" };
  if (current.direction === "asc") return { columnId, direction: "desc" };
  return null;
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  caption,
  emptyTitle,
  emptyDescription,
  loading = false,
  loadingRows = 6,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  visibleColumnIds,
  rowActions,
  onRowClick,
  className,
  stickyHeader = true,
  density = "comfortable",
}: DataTableProps<TData>) {
  const visibleColumns = columns.filter(
    (column) => !visibleColumnIds || visibleColumnIds.has(column.id),
  );
  const selectable = Boolean(selectedIds && onSelectionChange);
  const rowIds = data.map(getRowId);
  const selectedOnPage = selectedIds ? rowIds.filter((id) => selectedIds.has(id)).length : 0;
  const allSelected = data.length > 0 && selectedOnPage === data.length;
  const partiallySelected = selectedOnPage > 0 && !allSelected;

  const updateSelection = (nextIds: Set<string>) => {
    if (!onSelectionChange) return;
    const rows = data.filter((row, index) => nextIds.has(getRowId(row, index)));
    onSelectionChange({ selectedIds: nextIds, rows });
  };

  const cellPadding = density === "compact" ? "py-2" : "py-3";

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="overflow-x-auto">
        <Table>
          {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
          <TableHeader
            className={stickyHeader ? "sticky top-0 z-10 bg-card/95 backdrop-blur" : undefined}
          >
            <TableRow>
              {selectable ? (
                <TableHead className="w-11 px-3">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected}
                    indeterminate={partiallySelected}
                    onCheckedChange={(checked) => {
                      const next = new Set(selectedIds);
                      rowIds.forEach((id) => (checked === true ? next.add(id) : next.delete(id)));
                      updateSelection(next);
                    }}
                  />
                </TableHead>
              ) : null}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "end" && "text-right",
                    column.headerClassName,
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortable && onSortChange ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn("-ml-3 h-8", column.align === "end" && "ml-auto -mr-3")}
                      onClick={() => onSortChange(nextSort(sort, column.id))}
                      aria-label={`Sort by ${typeof column.header === "string" ? column.header : column.id}`}
                    >
                      {column.header}
                      <span aria-hidden="true" className="text-[10px] text-muted-foreground">
                        {sort?.columnId === column.id
                          ? sort.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {rowActions ? (
                <TableHead className="w-16">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <DataTableLoading
                columns={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                rows={loadingRows}
              />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="p-0"
                >
                  <DataTableEmpty
                    {...(emptyTitle !== undefined ? { title: emptyTitle } : {})}
                    {...(emptyDescription !== undefined ? { description: emptyDescription } : {})}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = getRowId(row, rowIndex);
                const selected = selectedIds?.has(rowId) ?? false;
                return (
                  <TableRow
                    key={rowId}
                    data-state={selected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable ? (
                      <TableCell
                        className={cn("px-3", cellPadding)}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          aria-label={`Select row ${rowIndex + 1}`}
                          checked={selected}
                          onCheckedChange={(checked) => {
                            const next = new Set(selectedIds);
                            if (checked === true) next.add(rowId);
                            else next.delete(rowId);
                            updateSelection(next);
                          }}
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          cellPadding,
                          column.align === "center" && "text-center",
                          column.align === "end" && "text-right",
                          column.className,
                        )}
                      >
                        {column.cell
                          ? column.cell(row, rowIndex)
                          : column.accessor
                            ? column.accessor(row)
                            : null}
                      </TableCell>
                    ))}
                    {rowActions ? (
                      <TableCell
                        className={cn("text-right", cellPadding)}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {rowActions(row)}
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
