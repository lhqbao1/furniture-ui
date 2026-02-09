import { getAllProductsSelect } from "@/features/product-group/api";
import { ProductItem } from "@/types/products";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface ExportSelectedProductsProps {
  product_ids: string[];
}

const ExportSelectedProducts = ({
  product_ids,
}: ExportSelectedProductsProps) => {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["all-products", status],
    queryFn: () =>
      getAllProductsSelect({
        all_products: null,
      }),
    enabled: false,
  });

  const buildExportData = (data: ProductItem[]) => {
    const clean = (val: any) => (val === null || val === undefined ? "" : val);

    return data.map((p) => {
      const rawTariff = clean(p.tariff_number);
      const tariff =
        rawTariff !== "" && rawTariff !== null && rawTariff !== undefined
          ? Number(rawTariff)
          : null;

      const rawVat = clean(p.tax);
      const vat =
        rawVat && rawVat.includes("%")
          ? Number(rawVat.replace("%", "").trim())
          : null;

      return {
        id: Number(clean(p.id_provider)),
        ean: clean(p.ean),
        status: p.is_active === true ? "ACTIVE" : "INACTIVE",
        brand_name: clean(p.brand?.name),
        supplier_name: clean(p.owner?.business_name),
        manufacturer_sku: clean(p.sku),
        manufacturing_country: clean(p.manufacture_country),
        customs_tariff_nr: Number.isFinite(tariff) ? tariff : null,
        name: clean(p.name),
        description: clean(p.description),
        technical_description: clean(p.technical_description),
        categories: clean(p.categories?.map((c) => c.code).join(", ")),
        category_name: clean(p.categories?.map((c) => c.name).join(", ")),
        unit: clean(p.unit),
        amount_unit: Number(clean(p.amount_unit)),
        delivery_time: clean(p.delivery_time),
        carrier: clean(p.carrier),
        net_purchase_cost: clean(p.cost),
        delivery_cost: clean(p.delivery_cost),
        return_cost: clean(p.return_cost),
        original_price: clean(p.price),
        sale_price: clean(p.final_price),
        vat: vat,
        stock: clean(p.stock),
        img_url: clean(
          p.static_files?.map((f) => f.url.replaceAll(" ", "%20")).join("|"),
        ),
        length: clean(p.length),
        width: clean(p.width),
        height: clean(p.height),
        weight: clean(p.weight),
        weee_nr: clean(p.weee_nr),
        eek: clean(p.eek),
        SEO_keywords: clean(p.meta_keywords),
        materials: clean(p.materials),
        color: clean(p.color),
        log_height: clean(p.packages?.reduce((s, q) => s + (q.height || 0), 0)),
        log_width: clean(p.packages?.reduce((s, q) => s + (q.width || 0), 0)),
        log_length: clean(p.packages?.reduce((s, q) => s + (q.length || 0), 0)),
        log_weight: clean(p.packages?.reduce((s, q) => s + (q.weight || 0), 0)),
        benutzerhandbuch: clean(
          p.pdf_files
            ?.filter((f) =>
              f?.title?.toLowerCase?.().includes("benutzerhandbuch"),
            )
            .map((f) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        sicherheit_information: clean(
          p.pdf_files
            ?.filter((f) => f?.title?.toLowerCase?.().includes("sicherheit"))
            .map((f) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        aufbauanleitung: clean(
          p.pdf_files
            ?.filter((f) =>
              f?.title?.toLowerCase?.().includes("aufbauanleitung"),
            )
            .map((f) => f.url.replaceAll(" ", "%20"))
            .join("|"),
        ),
        product_link: `https://www.prestige-home.de/de/product/${p.url_key}`,
      };
    });
  };

  const handleExportExcel = async () => {
    if (!product_ids.length) {
      toast.error("No products selected");
      return;
    }

    const toastId = toast.loading("Preparing export...");

    try {
      const res = await refetch();
      const data = res.data;
      if (!data?.length) {
        toast.error("No products available to export", { id: toastId });
        return;
      }

      const exportData = buildExportData(
        data.filter((i) => product_ids.includes(i.id)),
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
    <div
      className="cursor-pointer w-full text-start"
      onClick={() => handleExportExcel()}
    >
      Export Selected
    </div>
  );
};

export default ExportSelectedProducts;
