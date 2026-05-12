"use client";
import { useGetUserById } from "@/features/users/hook";
import AccountSkeleton from "./skeleton";
import AccountDetails from "./details";
import { useAtom } from "jotai";
import { authHydratedAtom, userIdAtom } from "@/store/auth";
import AccountLoginRequired from "./account-login-required";

const AccountForm = () => {
  const [userId] = useAtom(userIdAtom);
  const [authHydrated] = useAtom(authHydratedAtom);

  const { data: user, isLoading, isError } = useGetUserById(userId ?? "");

  if (!authHydrated) return <AccountSkeleton />;

  if (!userId) return <AccountLoginRequired />;

  if (isLoading) return <AccountSkeleton />;

  if (isError || !user) return <AccountLoginRequired />;

  return (
    <div className="col-span-12 lg:col-span-8">
      <AccountDetails user={user} />
    </div>
  );
};

export default AccountForm;
