export interface BranchItem {
  id: string | number;
  organization_id: string | number;
  name: string;
  code?: string | null | undefined;
  address?: string | null | undefined;
  is_active?: boolean | undefined;
  created_at?: string | undefined;
}

export interface DepartmentItem {
  id: string | number;
  organization_id: string | number;
  branch_id?: string | number | null | undefined;
  name: string;
  code?: string | null | undefined;
  is_active?: boolean | undefined;
  branch?: BranchItem | null | undefined;
  created_at?: string | undefined;
}

export interface DesignationItem {
  id: string | number;
  organization_id: string | number;
  name: string;
  code?: string | null | undefined;
  description?: string | null | undefined;
  is_active?: boolean | undefined;
  created_at?: string | undefined;
}

export interface OrganizationSummary {
  id: string | number;
  name: string;
  legal_name?: string | null | undefined;
  slug: string;
  subdomain?: string | null | undefined;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  address?: string | null | undefined;
  country?: string | null | undefined;
  currency?: string | null | undefined;
  timezone?: string | null | undefined;
  fiscal_year_start_month?: number | null | undefined;
  status: "active" | "inactive" | "suspended" | "trial" | string;
  members_count?: number | undefined;
  employees_count?: number | undefined;
  departments_count?: number | undefined;
  branches_count?: number | undefined;
  created_at: string;
  updated_at?: string | undefined;
}

export interface OrganizationDetails extends OrganizationSummary {
  branches?: BranchItem[] | undefined;
  departments?: DepartmentItem[] | undefined;
  designations?: DesignationItem[] | undefined;
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
}

export interface UpdateOrganizationCorporatePayload {
  name?: string | undefined;
  legal_name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
  country?: string | undefined;
  currency?: string | undefined;
  timezone?: string | undefined;
  fiscal_year_start_month?: number | undefined;
}
