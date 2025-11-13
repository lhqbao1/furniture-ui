"use client";
import { getMe } from "@/features/auth/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { getUserById } from "@/features/users/api";
import { useGetUserById } from "@/features/users/hook";

const AdminHeader = () => {
  const [userId, setUserId] = React.useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("userId") : ""
  );

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useGetUserById(userId ?? "");

  return (
    <div className="flex gap-4 items-center">
      <SidebarTrigger className={`border-none text-[#4D4D4D] relative`} />
      {/* <p className="text-base text-secondary">
        Hello,{" "}
        <span className="font-bold">
          {user?.first_name} {user?.last_name}
        </span>
      </p> */}
    </div>
  );
};

export default AdminHeader;
