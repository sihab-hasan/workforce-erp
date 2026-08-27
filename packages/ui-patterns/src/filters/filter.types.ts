import type * as React from "react";

export type FilterPrimitive = string | number | boolean | null | undefined;
export type FilterValue = FilterPrimitive | FilterPrimitive[];
export type FilterOperator =
  | "equals"
  | "not-equals"
  | "contains"
  | "starts-with"
  | "ends-with"
  | "in"
  | "not-in"
  | "before"
  | "after"
  | "between"
  | "is-empty"
  | "is-not-empty";

export type FilterOption = {
  label: string;
  value: string;
  description?: string;
};

export type FilterDefinition = {
  id: string;
  label: string;
  type?: "text" | "select" | "multi-select" | "boolean" | "date" | "custom";
  options?: FilterOption[];
  placeholder?: string;
  render?: (props: {
    value: FilterValue;
    onChange: (value: FilterValue) => void;
  }) => React.ReactNode;
};

export type ActiveFilter = {
  id: string;
  label: string;
  value: FilterValue;
  displayValue?: string;
  operator?: FilterOperator;
};

export type SavedView = {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  isShared?: boolean;
};
