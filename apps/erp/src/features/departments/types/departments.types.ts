export interface Department {
  id: string;
  name: string;
  code: string;
  branch_id?: string;
  branch_name?: string;
  head_of_department?: string;
  employee_count: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  branch_id?: string;
  head_of_department?: string;
  status: "active" | "inactive";
  description?: string;
}
