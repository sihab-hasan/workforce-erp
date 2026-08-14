export interface ApiResponse<TData> {
  data: TData
  message?: string
}

/**
 * Laravel-style paginated API response envelope.
 * Matches the shape returned by `Model::paginate()`.
 */
export interface PaginatedResponse<TData> {
  data: TData[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

/** Common query parameters for paginated list endpoints. */
export interface PaginationParams {
  page?: number
  per_page?: number
}

