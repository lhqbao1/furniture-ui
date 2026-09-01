import { apiUserV1, apiUserV1Public } from "@/lib/axios";
import type {
  UserAuthV1BootstrapAdminRequest,
  UserAuthV1LoginRequest,
  UserAuthV1TokenResponse,
  UserAuthV1UserReadResponse,
} from "@/types/user-auth-v1";

export async function loginUserV1(
  payload: UserAuthV1LoginRequest,
): Promise<UserAuthV1TokenResponse> {
  const { data } = await apiUserV1Public.post(
    "/api/v1/auth/login",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return data;
}

export async function getUserV1Me(): Promise<UserAuthV1TokenResponse> {
  const { data } = await apiUserV1.get("/api/v1/auth/me");

  return data;
}

export async function bootstrapUserV1Admin({
  payload,
  adminKey,
}: {
  payload: UserAuthV1BootstrapAdminRequest;
  adminKey: string;
}): Promise<UserAuthV1UserReadResponse> {
  const { data } = await apiUserV1Public.post(
    "/api/v1/auth/bootstrap-admin",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": adminKey,
      },
    },
  );

  return data;
}
