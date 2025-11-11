"use client";

import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar from "@/components/layout/admin/products/products-list/toolbar";
import { productColumnsDSP } from "@/components/layout/dsp/admin/products/list/columns";
import ProductTableSkeleton from "@/components/shared/table-skeleton";
import { useGetAllProductsDSP } from "@/features/dsp/products/hook";
import {
  searchProductQueryStringAtom,
  showAllProductsAtom,
} from "@/store/product";
import { useAtom } from "jotai";
import React, { useState } from "react";

const ProductListDSP = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useAtom<string>(
    searchProductQueryStringAtom
  );

  const [showAll, setShowAll] = useAtom(showAllProductsAtom);

  const { data, isLoading, isError } = useGetAllProductsDSP({
    page,
    page_size: pageSize,
    all_products: true,
    search: searchQuery,
  });

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-12">
      {/* <ProductStatistic statistic={statisticDemo} /> */}
      <div className="text-3xl text-secondary font-bold text-center">
        Product List
      </div>
      <TableToolbar
        searchQuery={searchQuery}
        pageSize={pageSize}
        setPageSize={setPageSize} // đảm bảo type đúng
        addButtonText="Add Product"
        addButtonUrl="/dsp/admin/products/add"
        setSearchQuery={setSearchQuery}
        setPage={setPage}
        showAll={showAll}
        setShowAll={setShowAll} // 🔥 truyền vào toolbar
      />
      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          data={data ? data.items : []}
          columns={productColumnsDSP}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          totalItems={data?.pagination.total_items ?? 0}
          totalPages={data?.pagination.total_pages ?? 0}
        />
      )}
    </div>
  );
};

export default ProductListDSP;
