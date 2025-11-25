import { api, apiAdmin } from "@/lib/axios";
import { AddressFormValues } from "@/lib/schema/address";
import { Address } from "@/types/address";

export async function getAddressByUserId(userId: string) {
  const { data } = await api.get(`/address/${userId}`);
  return data as Address[];
}

export async function getAddressByUserIdAdmin(userId: string) {
  const { data } = await apiAdmin.get(`/address/${userId}`);
  return data as Address[];
}

export async function getInvoiceAddressByUserId(userId: string) {
  const { data } = await api.get(`/invoice/address/${userId}`);
  return data as Address;
}

export async function getInvoiceAddressByUserIdAdmin(userId: string) {
  const { data } = await apiAdmin.get(`/invoice/address/${userId}`);
  return data as Address;
}

export async function createAddress(address: AddressFormValues) {
  const { data } = await api.post(`/address/${address.user_id}`, address, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    withCredentials: true,
  });
  return data;
}

export async function createInvoiceAddress(address: AddressFormValues) {
  const { data } = await api.post(
    `/invoice/address/${address.user_id}`,
    address,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      withCredentials: true,
    },
  );
  return data;
}

export async function getAddressByAddressId(addressId: string) {
  const { data } = await api.get(`/address/by-id/${addressId}`);
  return data as Address[];
}

export async function updatedAddress(
  addressId: string,
  address: Partial<AddressFormValues>,
) {
  const { data } = await api.put(`/address/${addressId}`, address, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    withCredentials: true,
  });
  return data as Address;
}

export async function updatedInvoiceAddress(
  invoice_address_id: string,
  address: Partial<AddressFormValues>,
) {
  const { data } = await api.put(
    `/invoice/address/${invoice_address_id}`,
    address,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      withCredentials: true,
    },
  );
  return data as Address;
}
export async function setDefaultAddress(addressId: string) {
  const { data } = await api.put(`/address/set-default/${addressId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    withCredentials: true,
  });
  return data as Address;
}

export async function deleteAddress(addressId: string) {
  const { data } = await api.delete(`/address/${addressId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    withCredentials: true,
  });
  return data;
}
