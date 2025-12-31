import { useQuery } from "@tanstack/react-query";
import { getInvoiceByUserId } from "./api";

export function useGetInvoiceByUserId(user_id: string) {
  return useQuery({
    queryKey: ["invoice-by-user-id"],
    queryFn: () => getInvoiceByUserId(user_id),
    retry: false,
    enabled: !!user_id,
  });
}
