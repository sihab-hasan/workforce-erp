import type { CorrelationId } from "./common";

export interface ApiProblem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  correlationId?: CorrelationId;
  errors?: Record<string, string[]>;
}

/** Common success envelope when the API chooses to wrap a resource. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Compatible with Laravel-style paginated resource metadata without coupling callers to Laravel. */
export interface PaginationMeta {
  currentPage: number;
  from?: number | null;
  lastPage: number;
  perPage: number;
  to?: number | null;
  total: number;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface RequestMetadata {
  correlationId?: CorrelationId;
  idempotencyKey?: string;
}

export type SortDirection = "asc" | "desc";
export interface SortField {
  field: string;
  direction: SortDirection;
}
export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryPrimitive | readonly QueryPrimitive[];
export type QueryParams = Record<string, QueryValue>;

export interface PaginationParams {
  page?: number;
  per_page?: number;
}
