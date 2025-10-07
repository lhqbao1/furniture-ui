import { google } from "googleapis";

const scopes = ["https://www.googleapis.com/auth/content"];

export async function getMerchantClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    scopes,
  });

  const merchant = google.merchantapi({
    version: "accounts_v1", // hoặc 'v1beta1'
    auth,
  });

  return merchant;
}
