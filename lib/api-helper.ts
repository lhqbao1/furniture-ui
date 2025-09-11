import { AxiosError } from "axios";
import { useTranslations } from "next-intl";

export function HandleApiError(error: unknown,t: (key: string) => string) {
  const axiosError = error as AxiosError<{ detail?: string }>;
  const status = axiosError.response?.status;
  const message =
    axiosError.response?.data?.detail || axiosError.message || "Unknown error";

  switch (status) {
    case 400:
      return { status, message: "Bad request: " + message };
    case 401:
      return { status, message: `${t('401')}` };
    case 403:
      return { status, message: "Forbidden: You don’t have permission." };
    case 404:
      return { status, message: "Resource not found." };
    case 500:
      return { status, message: "Server error. Try again later." };
    default:
      return { status, message };
  }
}
