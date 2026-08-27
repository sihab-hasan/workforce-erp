export type EntityId = string;
export type TenantKey = string;
export type CompanyKey = string;
export type ISODateString = string;
export type ISODateTimeString = string;
export type CorrelationId = string;

export interface AuditStamp {
  createdAt: ISODateTimeString;
  createdBy: EntityId;
  updatedAt?: ISODateTimeString;
  updatedBy?: EntityId;
}
export interface OffsetPageRequest {
  page?: number;
  pageSize?: number;
}
export interface OffsetPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface CursorPageRequest {
  cursor?: string;
  limit?: number;
}
export interface CursorPage<T> {
  items: T[];
  nextCursor?: string;
}
