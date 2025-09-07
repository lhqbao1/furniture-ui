import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { User } from "@/types/user"
import { getUserById, updateUser } from "./api"

export function useGetUserById(userId: string) {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  })
}


export function useUpdateUser() {
  const qc = useQueryClient()
    return useMutation({
      mutationFn: ({id, user}: {id: string, user: Partial<User>}) => updateUser(id, user),
      onSuccess: (data, variables) => {
        qc.refetchQueries({ queryKey: ["user", variables.id] })
      },
    })
}