import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContactPerson,
  deleteContactPerson,
  getAllContactPersons,
  getContactPersonDetail,
  POContactPersonInput,
  updateContactPerson,
} from "./api";
import { getAllWarehouses, getWarehouseDetail } from "../ware-house/api";

export const useCreateContactPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: POContactPersonInput) => createContactPerson(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contact-persons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
};

export const useUpdateContactPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: POContactPersonInput }) =>
      updateContactPerson(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contact-persons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contact-person-detail", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer"],
      });
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
};

export const useContactPersonDetail = (id?: string) =>
  useQuery({
    queryKey: ["contact-person-detail", id],
    queryFn: () => getContactPersonDetail(id!),
    enabled: !!id,
  });

export const useAllContactPersons = () =>
  useQuery({
    queryKey: ["contact-persons"],
    queryFn: getAllContactPersons,
  });

export const useDeleteContactPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContactPerson(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["contact-persons"],
      });
      queryClient.removeQueries({
        queryKey: ["contact-person-detail", id],
      });
    },
  });
};

export const useWarehouseDetail = (id?: string) =>
  useQuery({
    queryKey: ["warehouse-detail", id],
    queryFn: () => getWarehouseDetail(id!),
    enabled: !!id,
  });

export const useAllWarehouses = () =>
  useQuery({
    queryKey: ["warehouses"],
    queryFn: getAllWarehouses,
  });
