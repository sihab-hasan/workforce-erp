export interface OrganizationRecord {
  id: string;
  name: string;
  legal_name?: string | null;
  slug: string;
  subdomain?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timezone?: string | null;
  locale?: string | null;
  settings?: Record<string, unknown>;
  status: string;
  role?: string | null;
  stats?: { companies: number; departments: number; employees: number; users: number };
}

export interface CompanyRecord {
  id: string;
  organization_id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  timezone?: string | null;
  settings?: Record<string, unknown>;
  is_active: boolean;
  departments_count: number;
  employees_count: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code?: string | null;
  organization_id: string;
  branch?: { id: string; name: string; code?: string | null } | null;
  manager?: { id: string; name: string; employee_id: string } | null;
  employees_count: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EmployeeRecord {
  id: string;
  employee_id: string;
  user_id?: string | null;
  organization_id: string;
  branch_id?: string | null;
  department_id?: string | null;
  designation_id?: string | null;
  manager_id?: string | null;
  first_name: string;
  last_name: string;
  name: string;
  initials?: string;
  title?: string;
  designation?: { id: string; name: string } | null;
  department?: string;
  department_record?: { id: string; name: string; code?: string | null } | null;
  employmentType?: string;
  employment_type: string;
  status: string;
  manager?: string;
  manager_record?: { id: string; name: string; employee_id: string } | null;
  location?: string;
  branch?: { id: string; name: string; code?: string | null } | null;
  hireDate?: string | null;
  hire_date?: string | null;
  termination_date?: string | null;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
}

export interface LeaveRecord {
  id: string;
  status: string;
  employee: { id: string; employee_id: string; name: string; department?: string | null } | null;
  leave_type: { id: string; name: string; code: string; is_paid: boolean } | null;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string | null;
  review_note?: string | null;
  reviewer?: { id: string; name: string } | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  mime_type?: string | null;
  size_bytes: number;
  size_label: string;
  version: number;
  uploader?: { id: string; name: string } | null;
  download_url: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  action_url?: string | null;
  data: Record<string, unknown>;
  read_at?: string | null;
  is_read: boolean;
  created_at?: string | null;
}

export interface ApprovalRecord {
  id: string;
  entity_id: string;
  type: "leave" | "timesheet";
  title: string;
  subtitle: string;
  status: string;
  submitted_at?: string | null;
}
