export const config = {
  regions: ['fra1'],
};

import { api, apiAdmin, apiFlexible } from "@/lib/axios"
import { Customer, User } from "@/types/user"

export async function getUserById(id: string) {
  const { data } = await api.get(`/user/${id}`, { withCredentials: true })
  return data as Customer
}

export async function getUserByIdAdmin(id: string) {
  const { data } = await apiAdmin.get(`/user/${id}`, { withCredentials: true })
  return data as Customer
}

export async function updateUser(id: string, user: Partial<User>) {
  const { data } = await api.put(`/user/${id}`, user, { withCredentials: true })
  return data as Customer
}

export async function getAllCustomers() {
    const {data} = await apiAdmin.get(
        '/user',
    )
    return data as Customer[]
}

export async function deleteCustomer(user_id: string){
  const {data} = await apiAdmin.delete(
    `/user/${user_id}`
  )
  return data
}