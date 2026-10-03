export type InquiryStatus = "new" | "read" | "responded" | "archived";

export interface ContactInquiryItem {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string | null;
  message: string;
  status: InquiryStatus;
  ip_address?: string | null;
  read_at?: string | null;
  responded_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InquiriesCounts {
  total: number;
  new: number;
  read: number;
  responded: number;
  archived: number;
}

export interface InquiriesListResponse {
  data: ContactInquiryItem[];
  meta?: {
    counts: InquiriesCounts;
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface InquiriesFilterParams {
  status?: InquiryStatus | "all" | undefined;
  search?: string | undefined;
  page?: number | undefined;
  per_page?: number | undefined;
}
