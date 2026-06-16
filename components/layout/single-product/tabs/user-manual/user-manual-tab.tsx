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

  const groupedFiles = React.useMemo(() => {
    const groups = new Map<string, ProductPdfFiles[]>();

    (files ?? []).forEach((file) => {
      const title = file?.title?.trim();
      const url = file?.url?.trim();
      if (!title || !url) return;

      const currentFiles = groups.get(title) ?? [];
      currentFiles.push(file);
      groups.set(title, currentFiles);
    });

    return Array.from(groups.entries()).map(([title, groupFiles]) => ({
      title,
      files: groupFiles,
    }));
  }, [files]);

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
      {groupedFiles.map((group) => (
        <div
          key={group.title}
          className="flex flex-col gap-3 p-3"
        >
          <div className="font-bold">{group.title}</div>

          <div className="flex flex-wrap gap-2">
            {group.files.map((item, index) => (
              <Button
                key={`${group.title}-${item.url}`}
                variant="outline"
                className="flex items-center gap-2 w-fit"
                type="button"
                onClick={() => downloadFile(item.url)}
              >
                <FileText className="w-4 h-4 text-red-500" />
                {group.files.length > 1
                  ? `${t("download")} ${index + 1}`
                  : t("download")}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserManualTab;
