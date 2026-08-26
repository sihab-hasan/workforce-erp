import * as React from "react";

export function useSelection(initialIds: Iterable<string> = []) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set(initialIds));

  const setSelected = React.useCallback((id: string, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = React.useCallback((ids: Iterable<string>) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = React.useCallback(() => setSelectedIds(new Set()), []);

  return {
    selectedIds,
    setSelectedIds,
    setSelected,
    toggle,
    selectAll,
    clear,
    isSelected: React.useCallback((id: string) => selectedIds.has(id), [selectedIds]),
  };
}
