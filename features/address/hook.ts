import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAddress, createInvoiceAddress, deleteAddress, getAddressByAddressId, getAddressByUserId, getAddressByUserIdAdmin, getInvoiceAddressByUserId, getInvoiceAddressByUserIdAdmin, setDefaultAddress, updatedAddress, updatedInvoiceAddress } from "./api";
import { AddressFormValues } from "@/lib/schema/address";

export function useGetAddressByUserId(userId: string){
    return useQuery({
        queryKey: ["address-by-user"],
        queryFn: () => getAddressByUserId(userId),
        retry: false,
        enabled: !!userId,
     })
}

export function useGetAddressByUserIdAdmin(userId: string){
    return useQuery({
        queryKey: ["address-by-user"],
        queryFn: () => getAddressByUserIdAdmin(userId),
        retry: false,
        enabled: !!userId,
     })
}

export function useGetInvoiceAddressByUserId(userId: string){
    return useQuery({
        queryKey: ["invoice-address-by-user", userId],
        queryFn: () => getInvoiceAddressByUserId(userId),
        retry: false,
        enabled: !!userId,
     })
}

export function useGetInvoiceAddressByUserIdAdmin(userId: string){
    return useQuery({
        queryKey: ["invoice-address-by-user", userId],
        queryFn: () => getInvoiceAddressByUserIdAdmin(userId),
        retry: false,
        enabled: !!userId,
     })
}

export function useGetAddressByAddressId(addressId: string){
    return useQuery({
        queryKey: ["address-by-address"],
        queryFn: () => getAddressByAddressId(addressId),
        retry: false,
        enabled: !!addressId,
     })
}

export function useCreateAddress(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (address: AddressFormValues) => createAddress(address),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["address-by-user"] })
        },
    })
}

export function useCreateInvoiceAddress(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (address: AddressFormValues) => createInvoiceAddress(address),
        onSuccess: () => {
            qc.refetchQueries({queryKey: ["invoice-address-by-user"]})
        },
    })
}

export function useUpdateAddress(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({addressId, address}: {addressId: string, address: Partial<AddressFormValues>}) => updatedAddress(addressId, address),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["address-by-user"] })
        },
    })
}

export function useUpdateInvoiceAddress(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({addressId, address}: {addressId: string, address: Partial<AddressFormValues>}) => updatedInvoiceAddress(addressId, address),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["invoice-address-by-user"] })
        },
    })
}

export function useSetDefaultAddress(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (addressId: string) => setDefaultAddress(addressId),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["address-by-user"] })
        },
    })
}

export function useDeleteAddress(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (addressId: string) => deleteAddress(addressId),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ["address-by-user"] })
        },
    })
}