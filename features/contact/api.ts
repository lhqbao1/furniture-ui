import { apiAdmin, apiPublic } from "@/lib/axios";
import { StaticFileResponse } from "@/types/products";

export interface ContactFormInput {
  email: string;
  subject: string;
  message: string;
  order_id?: string;
  file_url?: string;
  type?: string;
}

export interface ContactFormResponse {
  email: string;
  subject: string;
  message: string;
  order_id: string;
  file_url: string;
  ticket: number;
  id: string;
  created_at: string;
  updated_at: string;
}

type SendMessageTawkPayload = {
  email: string;
  message: string;
};

type SendMessageTawkResponse = {
  success: boolean;
};

export async function uploadContactForm(input: ContactFormInput) {
  const { data } = await apiPublic.post("/contact/", input, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data as ContactFormResponse;
}

export async function getContactForm() {
  const { data } = await apiAdmin.get("/contact/");
  return data as ContactFormResponse;
}

export async function sendMessageTawk({
  email,
  message,
}: SendMessageTawkPayload): Promise<SendMessageTawkResponse> {
  const { data } = await apiPublic.post<SendMessageTawkResponse>(
    "/contact/tawk/send-message",
    { email, message },
  );

  return data;
}
