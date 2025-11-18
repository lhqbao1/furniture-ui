import { ProductPdfFiles } from "@/types/products";
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface UserManualTabProps {
  files: ProductPdfFiles[];
}

const UserManualTab = ({ files }: UserManualTabProps) => {
  const t = useTranslations();
  const downloadFile = async (url: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Lấy tên file chuẩn
      let fileName = url.split("/").pop() || "manual.pdf";

      // Bỏ query
      fileName = fileName.split("?")[0];

      // Sửa đuôi nếu sai
      fileName = fileName.replace(/\.pdf_?$/i, ".pdf");

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download file!");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {files?.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 p-3"
        >
          <div className="font-bold">{item.title}</div>

          <Button
            variant="outline"
            className="flex items-center gap-2 w-fit"
            type="button"
            onClick={() => downloadFile(item.url)}
          >
            <FileText className="w-4 h-4 text-red-500" />
            {t("download")}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default UserManualTab;
