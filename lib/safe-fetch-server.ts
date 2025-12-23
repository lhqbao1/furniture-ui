// lib/safe-request.ts
import { AxiosError } from "axios";

export async function safeRequest<T>(
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("[API_ERROR]", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error("[UNKNOWN_ERROR]", error);
    }

    return fallback;
  }
}
