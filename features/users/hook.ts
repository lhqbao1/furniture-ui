import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Customer, User } from "@/types/user";
import {
  deleteCustomer,
  getAllCustomers,
  getUserById,
  getUserByIdAdmin,
  updateUser,
  updateUserAdmin,
} from "./api";
import { AccountFormValues } from "@/lib/schema/account";

export function useGetUserById(userId: string) {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

export function useGetUserByIdAdmin(userId: string) {
  return useQuery<Customer>({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdAdmin(userId),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: AccountFormValues }) =>
      updateUser(id, user),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["user", variables.id] });
    },
  });
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: Partial<User> }) =>
      updateUserAdmin(id, user),
    onSuccess: (data, variables) => {
      qc.refetchQueries({ queryKey: ["user", variables.id] });
    },
  });
}

export function useGetAllCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => getAllCustomers(),
    retry: false,
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (user_id: string) => deleteCustomer(user_id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
