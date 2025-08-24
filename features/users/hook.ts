// features/users/hooks.ts
import { useAtomValue } from "jotai"
import { useQuery } from "@tanstack/react-query"
import { getUserById } from "./api"
import { userIdAtom } from "@/store/auth"
import { User } from "@/types/user"

export function useCurrentUser() {
  const userId = useAtomValue(userIdAtom)

  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId, // chỉ gọi khi có userId
  })
}
