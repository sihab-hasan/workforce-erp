import type { Role } from "#access/roles";
import type { Capability } from "#access/capabilities";
import type { AccessScope } from "#access/scopes";
export interface AccessGrant {
  role: Role;
  capability: Capability;
  scope: AccessScope;
}
