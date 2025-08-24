// features/users/api.ts
import api from "@/lib/axios"
import { User } from "@/types/user"

export async function getUserById(id: string) {
  const { data } = await api.get(`/user/${id}`, { withCredentials: true })
  return data as User
}
