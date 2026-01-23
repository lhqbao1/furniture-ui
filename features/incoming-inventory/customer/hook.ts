import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  CustomerCreateInput,
  deleteCustomer,
  getAllCustomers,
  getCustomerDetail,
  updateCustomer,
} from "./api";

type UpdateCustomerPayload = {
  customerId: string;
  input: CustomerCreateInput;
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CustomerCreateInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, input }: UpdateCustomerPayload) =>
      updateCustomer(customerId, input),

    onSuccess: (_data, variables) => {
      // 🔄 Refetch list
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      // 🔄 Refetch detail (nếu có)
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId],
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId),

    onSuccess: (_data, customerId) => {
      // 🔄 Refetch list
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      // 🔄 Clear / refetch detail
      queryClient.invalidateQueries({
        queryKey: ["customer", customerId],
      });
    },
  });
};

export const useGetAllCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getAllCustomers,
  });
};

export const useGetCustomer = (customerId?: string) => {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerDetail(customerId!),
    enabled: !!customerId, // 🔥 chỉ call khi có id
  });
};
