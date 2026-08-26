import * as React from "react";
import type {
  DataTableColumn,
  DataTablePaginationState,
  DataTableSort,
} from "../data-table/data-table.types";

export type UseDataTableOptions<TData> = {
  data: TData[];
  columns: DataTableColumn<TData>[];
  initialPageSize?: number;
  initialSort?: DataTableSort | null;
  searchText?: (row: TData) => string;
};

function compareValues(a: unknown, b: unknown) {
  const av = a instanceof Date ? a.getTime() : a;
  const bv = b instanceof Date ? b.getTime() : b;
  if (av == null && bv == null) return 0;
  if (av == null) return -1;
  if (bv == null) return 1;
  if (typeof av === "number" && typeof bv === "number") return av - bv;
  return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
}

export function useDataTable<TData>({
  data,
  columns,
  initialPageSize = 25,
  initialSort = null,
  searchText,
}: UseDataTableOptions<TData>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<DataTableSort | null>(initialSort);
  const [pagination, setPagination] = React.useState<DataTablePaginationState>({
    page: 1,
    pageSize: initialPageSize,
  });
  const [visibleColumnIds, setVisibleColumnIds] = React.useState<Set<string>>(
    () => new Set(columns.map((column) => column.id)),
  );

  React.useEffect(() => {
    setVisibleColumnIds((current) => {
      const available = new Set(columns.map((column) => column.id));
      const next = new Set([...current].filter((id) => available.has(id)));
      columns.forEach((column) => {
        if (!column.hideable) next.add(column.id);
      });
      return next;
    });
  }, [columns]);

  const filteredData = React.useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized || !searchText) return data;
    return data.filter((row) => searchText(row).toLocaleLowerCase().includes(normalized));
  }, [data, query, searchText]);

  const sortedData = React.useMemo(() => {
    if (!sort) return filteredData;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column?.sortValue) return filteredData;
    return [...filteredData].sort((a, b) => {
      const result = compareValues(column.sortValue?.(a), column.sortValue?.(b));
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, filteredData, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pagination.pageSize));
  const currentPage = Math.min(pagination.page, pageCount);
  const pageData = React.useMemo(() => {
    const start = (currentPage - 1) * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [currentPage, pagination.pageSize, sortedData]);

  React.useEffect(() => {
    if (pagination.page !== currentPage) {
      setPagination((current) => ({ ...current, page: currentPage }));
    }
  }, [currentPage, pagination.page]);

  const setPage = React.useCallback((page: number) => {
    setPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }, []);

  const setPageSize = React.useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize: Math.max(1, pageSize) });
  }, []);

  const toggleColumn = React.useCallback((columnId: string, visible: boolean) => {
    setVisibleColumnIds((current) => {
      const next = new Set(current);
      if (visible) next.add(columnId);
      else next.delete(columnId);
      return next;
    });
  }, []);

  return {
    query,
    setQuery,
    sort,
    setSort,
    pagination: { page: currentPage, pageSize: pagination.pageSize },
    setPagination,
    setPage,
    setPageSize,
    pageCount,
    totalRows: sortedData.length,
    filteredData,
    sortedData,
    pageData,
    visibleColumnIds,
    setVisibleColumnIds,
    toggleColumn,
  };
}
