"use client";

import { productMarketplaceColumns } from "@/components/layout/admin/products/marketplace/columns";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useGetAllProducts } from "@/features/products/hook";
import { useProductListFilters } from "@/hooks/admin/product-list/useProductListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { sortByStockAtom } from "@/store/product";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const ProductMarketplace = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🧠 Đọc page từ URL (mặc định 1)
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(50);
  const [sortByStock, setSortByStock] = useAtom(sortByStockAtom);
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
    const urlPage = Number(searchParams.get("page")) || 1;
    setPage(urlPage);
  }, [searchParams]);

  const { data, isLoading, isError } = useGetAllProducts({
    page,
    page_size: pageSize,
    all_products: filters.all_products,
    search: filters.search,
    sort_by_stock: filters.sort_by_stock,
    supplier_id: filters.supplier_id,
    brand_id: filters.brand,
  });
  const { data: exportData } = useGetProductsSelect();

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

    const target = new Set(multiSearchValues);
    return data.items.filter((item) => {
      const sku = item.sku ? String(item.sku).trim() : "";
      return target.has(sku);
    });
  }, [data?.items, multiSearchValues]);

  if (isError) return <div>No data</div>;
  // if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
  const columns = productMarketplaceColumns(setSortByStock);

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <div className="space-y-12 pb-12">
        {/* <ProductStatistic statistic={statisticDemo} /> */}
        <div className="text-3xl text-secondary font-bold text-center">
          Product Marketplace
        </div>
        <TableToolbar
          type={ToolbarType.product}
          pageSize={pageSize}
          setPageSize={setPageSize}
          addButtonText="Add Product"
          addButtonUrl="/admin/products/add"
          exportData={exportData}
          setPage={setPage}
        />
        {isLoading ? (
          <ProductTableSkeleton />
        ) : (
          <ProductTable
            data={filteredItems}
            columns={columns}
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
          />
        )}
      </div>
    </div>
  );
};

export default ProductMarketplace;
