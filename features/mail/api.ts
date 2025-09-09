import { api } from "@/lib/axios"
import { MailFormValues } from "@/types/mail"

export async function sendMail(item: MailFormValues) {
    const {data} = await api.post(
        `/payments/send-invoice-email`,
        item,
        {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            withCredentials: true,
        }
    )
    return data
  }