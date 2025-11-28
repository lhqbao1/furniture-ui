"use client";
import { useGetUserById } from "@/features/users/hook";
import React, { useEffect, useState } from "react";
import AccountSkeleton from "./skeleton";
import AccountDetails from "./details";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";

const AccountForm = () => {
  const [userId, setUserId] = useAtom(userIdAtom);

  const { data: user, isLoading, isError } = useGetUserById(userId ?? "");

  if (isLoading || isError || !user) return <AccountSkeleton />;

  return (
    <div className="col-span-12 lg:col-span-8">
      <AccountDetails user={user} />
    </div>
  );
};

export default AccountForm;
