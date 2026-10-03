import { cookieApiClient } from "#lib/api";
import type {
  ContactInquiryItem,
  InquiriesFilterParams,
  InquiriesListResponse,
  InquiryStatus,
} from "../types/inquiries.types";

export async function fetchInquiries(
  params: InquiriesFilterParams = {},
): Promise<InquiriesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString();
  const url = `/api/v1/platform/inquiries${query ? `?${query}` : ""}`;

  const res = await cookieApiClient.get<{
    success: boolean;
    data: {
      data: ContactInquiryItem[];
      current_page: number;
      last_page: number;
      total: number;
    };
    meta?: {
      counts: {
        total: number;
        new: number;
        read: number;
        responded: number;
        archived: number;
      };
    };
  }>(url);

  return {
    data: res?.data?.data ?? [],
    meta: {
      counts: res?.meta?.counts ?? {
        total: 0,
        new: 0,
        read: 0,
        responded: 0,
        archived: 0,
      },
      current_page: res?.data?.current_page ?? 1,
      last_page: res?.data?.last_page ?? 1,
      total: res?.data?.total ?? 0,
    },
  };
}

export async function fetchInquiryDetails(id: string | number): Promise<ContactInquiryItem> {
  const res = await cookieApiClient.get<{
    success: boolean;
    data: ContactInquiryItem;
  }>(`/api/v1/platform/inquiries/${encodeURIComponent(String(id))}`);

  return res.data;
}

export async function updateInquiryStatus(
  id: string | number,
  status: InquiryStatus,
): Promise<ContactInquiryItem> {
  const res = await cookieApiClient.patch<{
    success: boolean;
    data: ContactInquiryItem;
  }>(`/api/v1/platform/inquiries/${encodeURIComponent(String(id))}/status`, { status });

  return res.data;
}

export async function deleteInquiry(id: string | number): Promise<void> {
  await cookieApiClient.delete(`/api/v1/platform/inquiries/${encodeURIComponent(String(id))}`);
}
