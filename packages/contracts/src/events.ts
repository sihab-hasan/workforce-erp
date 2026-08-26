import type { CorrelationId, EntityId, ISODateTimeString, TenantKey, CompanyKey } from "./common";
export interface EventEnvelope<TPayload = unknown> {
  id: string;
  type: string;
  version: number;
  occurredAt: ISODateTimeString;
  source: string;
  payload: TPayload;
  correlationId?: CorrelationId;
  causationId?: string;
  tenantKey?: TenantKey;
  companyKey?: CompanyKey;
  actorId?: EntityId;
}
