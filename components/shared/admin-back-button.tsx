"use client";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";

const AdminBackButton = () => {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant={"ghost"}
      className="flex items-center bg-gray-100 hover:bg-gray-200"
      onClick={() => router.back()}
    >
      <ArrowLeft />
      Back
    </Button>
  );
};

export default AdminBackButton;
