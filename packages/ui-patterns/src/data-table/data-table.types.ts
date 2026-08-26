import type * as React from "react";

export type DataTableAlign = "start" | "center" | "end";
export type DataTableSortDirection = "asc" | "desc";

export type DataTableSort = {
  columnId: string;
  direction: DataTableSortDirection;
};

export type DataTableColumn<TData> = {
  id: string;
  header: React.ReactNode;
  accessor?: (row: TData) => React.ReactNode;
  cell?: (row: TData, rowIndex: number) => React.ReactNode;
  sortValue?: (row: TData) => string | number | Date | null | undefined;
  sortable?: boolean;
  hideable?: boolean;
  align?: DataTableAlign;
  className?: string;
  headerClassName?: string;
  width?: string | number;
};

export type DataTableSelection<TData> = {
  selectedIds: Set<string>;
  rows: TData[];
};

export type DataTablePaginationState = {
  page: number;
  pageSize: number;
};

export type DataTableProps<TData> = {
  data: TData[];
  columns: DataTableColumn<TData>[];
  getRowId: (row: TData, index: number) => string;
  caption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  loadingRows?: number;
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (selection: DataTableSelection<TData>) => void;
  visibleColumnIds?: Set<string>;
  rowActions?: (row: TData) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
  stickyHeader?: boolean;
  density?: "comfortable" | "compact";
};
