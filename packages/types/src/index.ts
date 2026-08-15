export interface ApiResponse<TData = any> {
  success: boolean
  message?: string
  data?: TData
  errors?: Record<string, string[]>
  meta?: ApiPaginationMeta
  links?: ApiPaginationLinks
}

export interface ApiPaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface ApiPaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
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
