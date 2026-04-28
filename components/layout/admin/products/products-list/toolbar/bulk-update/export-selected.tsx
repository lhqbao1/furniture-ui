import { buildProductExportData } from "../export-utils";
import { ProductItem } from "@/types/products";
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface ExportSelectedProductsProps {
  product_ids: string[];
  products: ProductItem[];
}

const ExportSelectedProducts = ({
  product_ids,
  products,
}: ExportSelectedProductsProps) => {
  const handleExportExcel = async () => {
    if (!product_ids.length) {
      toast.error("No products selected");
      return;
    }

    const toastId = toast.loading("Preparing export...");

    try {
      if (!products.length) {
        toast.error("No products available to export", { id: toastId });
        return;
      }

      const exportData = buildProductExportData(
        products.filter((item) => product_ids.includes(item.id)),
      );

      if (!exportData.length) {
        toast.error("No selected products found", { id: toastId });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `export-${Date.now()}.xlsx`,
      );
      toast.success("Export completed", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Export failed", { id: toastId });
    }
  };
  return (
    <button
      type="button"
      className="w-full text-start"
      onClick={() => void handleExportExcel()}
    >
      Export Selected
    </button>
  );
};

export default ExportSelectedProducts;
