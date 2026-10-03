export type TenantStatus = "active" | "inactive" | "suspended" | "trial";
export type SubscriptionPlan = "enterprise" | "business" | "pro" | "starter" | "trial";

export interface TenantSummary {
  id: string | number;
  name: string;
  legal_name?: string | null | undefined;
  slug: string;
  subdomain?: string | null | undefined;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  country?: string | null | undefined;
  currency?: string | null | undefined;
  timezone?: string | null | undefined;
  plan: SubscriptionPlan | string;
  status: TenantStatus;
  subscription_status?: string | null | undefined;
  trial_started_at?: string | null | undefined;
  trial_ends_at?: string | null | undefined;
  subscription_started_at?: string | null | undefined;
  subscription_ends_at?: string | null | undefined;
  members_count?: number | undefined;
  employees_count?: number | undefined;
  departments_count?: number | undefined;
  branches_count?: number | undefined;
  created_at: string;
  updated_at?: string | undefined;
}

export interface TenantDetails extends TenantSummary {
  members?:
    | Array<{
        id: string | number;
        name: string;
        email: string;
        pivot: {
          role: string;
          status: string;
        };
      }>
    | undefined;
  settings?: Record<string, unknown> | null | undefined;
  roles_count?: number | undefined;
  timesheets_count?: number | undefined;
  documents_count?: number | undefined;
}

export interface CreateTenantPayload {
  name: string;
  legal_name?: string | undefined;
  slug?: string | undefined;
  subdomain?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  country?: string | undefined;
  currency?: string | undefined;
  timezone?: string | undefined;
  plan?: string | undefined;
  status?: string | undefined;
  owner_name?: string | undefined;
  owner_email?: string | undefined;
  owner_password?: string | undefined;
}

export interface UpdateTenantPayload {
  name?: string | undefined;
  legal_name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  country?: string | undefined;
  currency?: string | undefined;
  timezone?: string | undefined;
  plan?: string | undefined;
  status?: string | undefined;
  subscription_status?: string | undefined;
}
