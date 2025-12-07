"use client";
import { useRouter } from "@/src/i18n/navigation";
import { Eye } from "lucide-react";
import { useLocale } from "next-intl";
import React from "react";

interface AdminViewProps {
  productId: string;
}

const AdminView = ({ productId }: AdminViewProps) => {
  const router = useRouter();
  const locale = useLocale();
  const [adminId, setAdminId] = React.useState<string | null>(
    localStorage.getItem("admin_access_token"),
  );
  return (
    <>
      {adminId && (
        <div
          className="cursor-pointer text-primary"
          onClick={() =>
            router.push(`/admin/products/${productId}/edit`, {
              locale,
            })
          }
        >
          <Eye />
        </div>
      )}
    </>
  );
};

export default AdminView;
