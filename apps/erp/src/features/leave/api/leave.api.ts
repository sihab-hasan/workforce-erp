import type { createHttpClient } from "@workforce-erp/api-client";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@workforce-erp/contracts";
import type { LeaveFilters } from "../types/leave-filters.types";
import type { CreateLeavePayload, Leave, LeaveOptions } from "../types/leave.types";

/** Snake-case pagination meta emitted by the Laravel paginator. */
interface LaravelPaginationMeta {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  per_page?: number;
  to?: number | null;
  total?: number;
}

interface LaravelPaginatedEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T[];
  meta?: LaravelPaginationMeta;
  links?: PaginatedResponse<T>["links"];
}

// Contracts expose camelCase pagination meta while the Laravel paginator emits
// snake_case; normalise once here so consumers can rely on PaginationMeta.
function toPaginatedResponse<T>(envelope: LaravelPaginatedEnvelope<T>): PaginatedResponse<T> {
  const meta = envelope.meta ?? {};
  const paginationMeta: PaginationMeta = {
    currentPage: meta.current_page ?? 1,
    lastPage: meta.last_page ?? 1,
    perPage: meta.per_page ?? 0,
    total: meta.total ?? 0,
  };
  if (meta.from !== undefined) paginationMeta.from = meta.from;
  if (meta.to !== undefined) paginationMeta.to = meta.to;

  const response: PaginatedResponse<T> = { data: envelope.data ?? [], meta: paginationMeta };
  if (envelope.links) response.links = envelope.links;
  return response;
}

/**
 * Creates a Leave API object bound to a specific HTTP client.
 */
export function createLeaveApi(http: ReturnType<typeof createHttpClient>) {
  return {
    /**
     * `GET /api/v1/leave-requests`
     * Fetches a paginated, filterable list of leave requests.
     */
    async list(filters?: LeaveFilters): Promise<PaginatedResponse<Leave>> {
      const envelope = await http.get<LaravelPaginatedEnvelope<Leave>>(
        "/api/v1/leave-requests",
        filters as Record<string, string | number | boolean | undefined | null>,
      );
      return toPaginatedResponse(envelope);
    },

    /**
     * `GET /api/v1/leave-requests/options`
     * Fetches active leave types with the current user's allowance balances.
     */
    options(): Promise<ApiResponse<LeaveOptions>> {
      return http.get<ApiResponse<LeaveOptions>>("/api/v1/leave-requests/options");
    },

    /**
     * `GET /api/v1/leave-requests/{id}`
     * Fetches the full leave request details by ID.
     */
    show(id: string): Promise<ApiResponse<Leave>> {
      return http.get<ApiResponse<Leave>>(`/api/v1/leave-requests/${id}`);
    },

    /**
     * `POST /api/v1/leave-requests`
     * Submits a new leave request for the current employee profile.
     */
    create(payload: CreateLeavePayload): Promise<ApiResponse<Leave>> {
      return http.post<ApiResponse<Leave>>("/api/v1/leave-requests", payload);
    },

    /**
     * `PATCH /api/v1/leave-requests/{id}/cancel`
     * Cancels a leave request owned by the current user.
     */
    cancel(id: string): Promise<ApiResponse<Leave>> {
      return http.patch<ApiResponse<Leave>>(`/api/v1/leave-requests/${id}/cancel`, {});
    },

    /**
     * `PATCH /api/v1/leave-requests/{id}/approve`
     * Approves a pending leave request. Requires the `leave.approve` capability.
     */
    approve(id: string): Promise<ApiResponse<Leave>> {
      return http.patch<ApiResponse<Leave>>(`/api/v1/leave-requests/${id}/approve`, {});
    },

    /**
     * `PATCH /api/v1/leave-requests/{id}/reject`
     * Rejects a pending leave request. Requires the `leave.approve` capability.
     */
    reject(id: string): Promise<ApiResponse<Leave>> {
      return http.patch<ApiResponse<Leave>>(`/api/v1/leave-requests/${id}/reject`, {});
    },
  };
}

export type LeaveApi = ReturnType<typeof createLeaveApi>;
