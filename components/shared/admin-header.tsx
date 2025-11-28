"use client";
import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";

const AdminHeader = () => {
  const [userId, setUserId] = useAtom(userIdAtom);

  return (
    <div className="flex gap-4 items-center">
      <SidebarTrigger className={`border-none text-[#4D4D4D] relative`} />
    </div>
  );
};

export default AdminHeader;
