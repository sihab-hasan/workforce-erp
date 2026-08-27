export const SCOPES = ["self", "department", "company", "organization"] as const;
export type AccessScope = (typeof SCOPES)[number];
