import { Button } from "@/components/ui/button";
import { Category, CategoryResponse } from "@/types/categories";
import { Loader2 } from "lucide-react";
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExportCategoryProps {
  categories: CategoryResponse[];
  isFetching: boolean;
}

const ExportCategory = ({ categories, isFetching }: ExportCategoryProps) => {
  const handleExport = async () => {
    if (!categories?.length) return;

    const clean = (val: any) => (val === null || val === undefined ? "" : val);

    const flattenCategories = (
      categories: CategoryResponse[],
    ): CategoryResponse[] => {
      let result: CategoryResponse[] = [];

      categories.forEach((cat) => {
        result.push(cat);
        if (cat.children?.length) {
          result = result.concat(flattenCategories(cat.children));
        }
      });

      return result;
    };

    const childrenOnly = flattenCategories(categories).filter(
      (cat) => cat.parent_id !== null,
    );

    const exportData = childrenOnly.map((c) => ({
      id: clean(c.code),
      name: clean(c.name),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "categories.xlsx");
  };

  return (
    <Button
      onClick={handleExport}
      className="w-fit"
      disabled={isFetching}
    >
      {isFetching ? <Loader2 className="animate-spin" /> : "Export Excel"}
    </Button>
  );
};

export default ExportCategory;
