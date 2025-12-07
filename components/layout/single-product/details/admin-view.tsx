"use client";
import { useRouter } from "@/src/i18n/navigation";
import { Eye } from "lucide-react";
import { useLocale } from "next-intl";
import React, { useEffect, useState } from "react";

interface AdminViewProps {
  productId: string;
}

const AdminView = ({ productId }: AdminViewProps) => {
  const router = useRouter();
  const locale = useLocale();
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");
    setAdminId(token);
  }, []);

  return (
    <>
      {adminId && (
        <div
          className="cursor-pointer text-primary"
          onClick={() =>
            router.push(`/admin/products/${productId}/edit`, { locale })
          }
        >
          <Eye />
        </div>
      )}
    </>
  );
};

export default AdminView;
