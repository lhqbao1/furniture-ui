import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BrandResponse } from "@/types/brand";

interface ExportBrandProps {
  brands: BrandResponse[];
  isFetching: boolean;
}

const ExportBrand = ({ brands, isFetching }: ExportBrandProps) => {
  const handleExport = async () => {
    if (!brands?.length) return;

    const clean = (val: any) => (val === null || val === undefined ? "" : val);

    const exportData = brands.map((c) => ({
      id: clean(c.code),
      name: clean(c.name),
      company_name: clean(c.company_name),
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

    saveAs(blob, "brands.xlsx");
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

export default ExportBrand;
