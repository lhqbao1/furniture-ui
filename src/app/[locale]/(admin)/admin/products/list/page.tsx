"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import { useGetAllProducts } from "@/features/products/hook";
import {
  productListColumnVisibilityByUserAtom,
  sortByStockAtom,
} from "@/store/product";
import { useAtom, useAtomValue } from "jotai";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getProductColumns } from "@/components/layout/admin/products/products-list/column";
import { useProductListFilters } from "@/hooks/admin/product-list/useProductListFilter";
import { OnChangeFn, VisibilityState } from "@tanstack/react-table";
import { adminIdAtom } from "@/store/auth";
import { Loader2 } from "lucide-react";

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
  { id: "incoming_stock", label: "Incoming Stock" },
  { id: "carrier", label: "Carrier" },
  { id: "color", label: "Color" },
  { id: "materials", label: "Materials" },
  { id: "component", label: "Component" },
];

const DEFAULT_VISIBLE_PRODUCT_COLUMNS = new Set(
  PRODUCT_COLUMN_OPTIONS.map((column) => column.id).filter(
    (id) => !["color", "materials", "component"].includes(id),
  ),
);

const ProductList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortByStock, setSortByStock] = useAtom(sortByStockAtom);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const adminId = useAtomValue(adminIdAtom);
  const [columnVisibilityByUser, setColumnVisibilityByUser] = useAtom(
    productListColumnVisibilityByUserAtom,
  );
  const visibilityKey = adminId ?? "anonymous";
  const defaultVisibility = useMemo(
    () =>
      Object.fromEntries(
        PRODUCT_COLUMN_OPTIONS.map((column) => [
          column.id,
          DEFAULT_VISIBLE_PRODUCT_COLUMNS.has(column.id),
        ]),
      ) as VisibilityState,
    [],
  );
  const storedVisibility = columnVisibilityByUser[visibilityKey];
  const columnVisibility = useMemo(
    () => ({ ...defaultVisibility, ...(storedVisibility ?? {}) }),
    [defaultVisibility, storedVisibility],
  );

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibilityByUser((prev) => {
      const current = {
        ...defaultVisibility,
        ...(prev[visibilityKey] ?? {}),
      };
      return {
        ...prev,
        [visibilityKey]: {
          ...current,
          [columnId]: visible,
        },
      };
    });
  };

  const handleTableColumnVisibilityChange: OnChangeFn<VisibilityState> = (
    updater,
  ) => {
    setColumnVisibilityByUser((prev) => {
      const current = {
        ...defaultVisibility,
        ...(prev[visibilityKey] ?? {}),
      };
      const next =
        typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [visibilityKey]: next };
    });
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

  const { data, isLoading, isFetching, isError } = useGetAllProducts({
    page,
    page_size: pageSize,
    all_products: filters.all_products,
    search: filters.search,
    sort_by_stock: sortByStock,
    supplier_id: filters.supplier_id,
    brand_id: filters.brand,
  });

  const multiSearchRaw = searchParams.get("multi_search") ?? "";
  const multiSearchValues = useMemo(
    () =>
      multiSearchRaw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    [multiSearchRaw],
  );

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (multiSearchValues.length === 0) return data.items;

    const normalize = (value: unknown) =>
      String(value ?? "")
        .trim()
        .toLowerCase();
    const target = new Set(multiSearchValues.map(normalize).filter(Boolean));

    return data.items.filter((item) => {
      const candidates = [item.sku, item.ean, item.id_provider]
        .map(normalize)
        .filter(Boolean);
      return candidates.some((candidate) => target.has(candidate));
    });
  }, [data?.items, multiSearchValues]);

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
  }, [data, isLoading]);

  if (isError) return <div>No data</div>;

  return (
    <div className="relative h-screen flex flex-col gap-6 pb-6 overflow-hidden">
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
        <ProductTable
          data={filteredItems}
          columns={getProductColumns(setSortByStock)}
          page={page}
          pageSize={pageSize}
            setPage={handlePageChange}
            setPageSize={setPageSize}
            totalItems={
              multiSearchValues.length > 0
                ? filteredItems.length
                : (data?.pagination.total_items ?? 0)
            }
            totalPages={
              multiSearchValues.length > 0
                ? 1
                : (data?.pagination.total_pages ?? 0)
            }
            hasHeaderBackGround
            isSticky
            stickyContainerClassName="h-full"
            onSelectionChange={setSelectedProductIds} // 👈 đây
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleTableColumnVisibilityChange}
            enableClientSorting
          />
      </div>

      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <Loader2 className="size-10 animate-spin text-secondary" />
        </div>
      )}
    </div>
  );
};

export default ProductList;
