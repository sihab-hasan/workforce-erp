import * as React from "react";
import type { ActiveFilter, FilterValue } from "../filters/filter.types";

export function useFilters(initialFilters: ActiveFilter[] = []) {
  const [filters, setFilters] = React.useState<ActiveFilter[]>(initialFilters);

  const setFilter = React.useCallback((filter: ActiveFilter) => {
    setFilters((current) => {
      const next = current.filter((item) => item.id !== filter.id);
      return [...next, filter];
    });
  }, []);

  const updateValue = React.useCallback((id: string, value: FilterValue) => {
    setFilters((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
  }, []);

  const removeFilter = React.useCallback((id: string) => {
    setFilters((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearFilters = React.useCallback(() => setFilters([]), []);

  return {
    filters,
    setFilters,
    setFilter,
    updateValue,
    removeFilter,
    clearFilters,
    hasActiveFilters: filters.length > 0,
  };
}
