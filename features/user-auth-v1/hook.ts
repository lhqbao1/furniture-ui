"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bootstrapUserV1Admin,
  getUserV1Me,
  loginUserV1,
} from "@/features/user-auth-v1/api";
import type {
  UserAuthV1BootstrapAdminRequest,
  UserAuthV1LoginRequest,
} from "@/types/user-auth-v1";

export const userAuthV1Keys = {
  all: ["user-auth-v1"] as const,
  me: () => [...userAuthV1Keys.all, "me"] as const,
};

export function useUserV1Login() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserAuthV1LoginRequest) => loginUserV1(payload),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("user_v1_access_token", data.access_token);
        localStorage.setItem("user_v1_user_id", data.user.id);
      }

      queryClient.setQueryData(userAuthV1Keys.me(), data);
    },
  });
}

export function useUserV1Me() {
  return useQuery({
    queryKey: userAuthV1Keys.me(),
    queryFn: getUserV1Me,
    retry: false,
    enabled:
      typeof window !== "undefined" &&
      !!localStorage.getItem("user_v1_access_token"),
  });
}

export function useBootstrapUserV1Admin() {
  return useMutation({
    mutationFn: ({
      payload,
      adminKey,
    }: {
      payload: UserAuthV1BootstrapAdminRequest;
      adminKey: string;
    }) => bootstrapUserV1Admin({ payload, adminKey }),
  });
}
