"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetAllProducts } from "@/features/products/hook";
import { sortByStockAtom } from "@/store/product";
import { useAtom } from "jotai";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getProductColumns } from "@/components/layout/admin/products/products-list/column";
import { useProductListFilters } from "@/hooks/admin/product-list/useProductListFilter";
import { VisibilityState } from "@tanstack/react-table";

const PRODUCT_COLUMN_OPTIONS: {
  id: string;
  label: string;
  alwaysVisible?: boolean;
}[] = [
  { id: "static_files", label: "Image" },
  { id: "id", label: "ID" },
  { id: "name", label: "Name" },
  { id: "sku", label: "SKU" },
  { id: "brand", label: "Brand" },
  { id: "ean", label: "EAN" },
  { id: "owner", label: "Supplier" },
  { id: "category", label: "Category" },
  { id: "stock", label: "Stock" },
  { id: "is_active", label: "Status" },
  { id: "cost", label: "Cost" },
  { id: "shipping_cost", label: "Delivery Cost" },
  { id: "final_price", label: "Final Price" },
  { id: "margin", label: "Margin" },
  { id: "carrier", label: "Carrier" },
];

const DEFAULT_VISIBLE_PRODUCT_COLUMNS = new Set(
  PRODUCT_COLUMN_OPTIONS.map((column) => column.id),
);

const ProductList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortByStock, setSortByStock] = useAtom(sortByStockAtom);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      Object.fromEntries(
        PRODUCT_COLUMN_OPTIONS.map((column) => [
          column.id,
          DEFAULT_VISIBLE_PRODUCT_COLUMNS.has(column.id),
        ]),
      ) as VisibilityState,
  );

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }));
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);

  const filters = useProductListFilters();

  // ⚡ Cập nhật URL mỗi khi page thay đổi
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // 🧩 Khi user back lại (hoặc reload), đọc page từ URL
  useEffect(() => {
    const param = searchParams.get("page");
    if (param !== null) {
      setPage(Number(param));
    }
  }, [searchParams]);

  const { data, isLoading, isError } = useGetAllProducts({
    page,
    page_size: pageSize,
    all_products: filters.all_products,
    search: filters.search,
    sort_by_stock: sortByStock,
    supplier_id: filters.supplier_id,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const wrapper = tableWrapRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const bottomPadding = 24; // matches pb-6
      const available = window.innerHeight - rect.top - bottomPadding;
      setTableHeight(Math.max(240, available));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  if (isError) return <div>No data</div>;

  return (
    <div className="h-screen flex flex-col gap-6 pb-6 overflow-hidden">
      <div className="text-3xl text-secondary font-bold text-center">
        Product List
      </div>
      <TableToolbar
        pageSize={pageSize}
        setPageSize={setPageSize}
        addButtonText="Add Product"
        addButtonUrl="/admin/products/add"
        exportData={[]}
        setPage={setPage}
        type={ToolbarType.product}
        product_ids={selectedProductIds} // 👈 thêm prop nếu cần
        columnOptions={PRODUCT_COLUMN_OPTIONS}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <div
        ref={tableWrapRef}
        className="min-h-0"
        style={tableHeight ? { height: `${tableHeight}px` } : undefined}
      >
        {isLoading ? (
          <ProductTableSkeleton />
        ) : (
          <ProductTable
            data={data ? data.items : []}
            columns={getProductColumns(setSortByStock)}
            page={page}
            pageSize={pageSize}
            setPage={handlePageChange}
            setPageSize={setPageSize}
            totalItems={data?.pagination.total_items ?? 0}
            totalPages={data?.pagination.total_pages ?? 0}
            hasHeaderBackGround
            isSticky
            stickyContainerClassName="h-full"
            onSelectionChange={setSelectedProductIds} // 👈 đây
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
