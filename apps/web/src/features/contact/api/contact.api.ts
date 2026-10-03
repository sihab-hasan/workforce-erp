import { createAppApiClient } from "#lib/api";

export interface ContactSubmissionPayload {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    created_at: string;
  };
}

export async function submitContactInquiry(
  payload: ContactSubmissionPayload,
): Promise<ContactSubmissionResult> {
  const endpoint = "/api/v1/public/contact";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        company: payload.company || undefined,
        message: payload.message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Submission failed with status ${res.status}`);
    }

    return {
      success: true,
      message:
        data?.message ||
        "Thank you for reaching out. Your message has been received by our platform team.",
      data: data?.data,
    };
  } catch (error) {
    // If fetch failed, try via api client
    try {
      const client = createAppApiClient();
      const response = await client.post<ContactSubmissionResult>("/v1/public/contact", payload);
      if (response) {
        return response;
      }
    } catch {
      // rethrow original or formatted error
    }

    const message =
      error instanceof Error ? error.message : "Failed to send message. Please try again.";
    throw new Error(message);
  }
}
