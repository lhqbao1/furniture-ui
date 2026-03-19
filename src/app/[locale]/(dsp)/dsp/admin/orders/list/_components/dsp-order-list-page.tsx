"use client";

import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { orderChildSupplierColumns } from "@/components/layout/dsp/admin/order/order-list/columns";
import ExportCheckOutButton from "@/components/layout/dsp/admin/order/order-list/export-excel-button";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetCheckOutSupplier } from "@/features/checkout/hook";
import React, { useMemo, useState } from "react";

type DSPOrderListPageProps = {
  statuses: string[];
  title?: string;
};

const normalizeStatusParams = (statuses: string[]) =>
  statuses.map((status) => status.trim().toUpperCase()).filter(Boolean);

export default function DSPOrderListPage({
  statuses,
  title = "Order List",
}: DSPOrderListPageProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const statusParams = useMemo(
    () => normalizeStatusParams(statuses),
    [statuses],
  );

  const { data, isLoading } = useGetCheckOutSupplier({
    page,
    page_size: pageSize,
    status: statusParams,
  });

  return (
    <div className="space-y-4 pb-30">
      <div className="text-3xl text-secondary font-bold text-center">
        {title}
      </div>
      <div className="flex justify-end">
        <ExportCheckOutButton data={data?.items ?? []} />
      </div>
      {isLoading ? (
        <ProductTableSkeleton columnsCount={6} rowsCount={6} />
      ) : (
        <ProductTable
          hasHeaderBackGround
          data={data ? data.items : []}
          columns={orderChildSupplierColumns}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalItems={data?.pagination.total_items ?? 0}
          totalPages={data?.pagination.total_pages ?? 0}
          hasBackground
          hasExpanded
          hasPagination={false}
          hasCount={false}
        />
      )}
    </div>
  );
}
