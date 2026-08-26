export type Permission = string;
export interface ResourceScope {
  type: string;
  ids?: readonly string[];
  attributes?: Record<string, unknown>;
}
export interface AuthorizationContext {
  permissions: readonly Permission[];
  attributes?: Record<string, unknown>;
  scopes?: readonly ResourceScope[];
}
export interface PolicyRequest {
  action: string;
  resource?: string;
  resourceId?: string;
  context: AuthorizationContext;
}
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  obligations?: Record<string, unknown>;
}
