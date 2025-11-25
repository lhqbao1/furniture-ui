import { apiAdmin, apiPublic } from "@/lib/axios";
import { StaticFileResponse } from "@/types/products";

export interface ContactFormInput {
  email: string;
  subject: string;
  message: string;
  order_id?: string;
  file_url?: string;
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
