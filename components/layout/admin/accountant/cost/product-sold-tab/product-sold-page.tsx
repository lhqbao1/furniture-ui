"use client";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetProductsCheckOutDashboard } from "@/features/checkout/hook";
import { getMonthRange } from "@/hooks/get-previous-month";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { ProviderTable } from "./table";
import { DashboardStats } from "./stat";
import { DashboardStatsSkeleton } from "./stats-skeleton";
import { ProviderDrawer } from "./product-drawer";

const ProductSoldPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const searchParams = useSearchParams();

  const fromDateParam = searchParams.get("from_date") ?? undefined;

  // 🔹 Tháng đang chọn
  const selectedMonth = React.useMemo(
    () => (fromDateParam ? new Date(fromDateParam) : new Date()),
    [fromDateParam],
  );

  // 🔹 Range tháng hiện tại
  const currentRange = React.useMemo(
    () => getMonthRange(selectedMonth),
    [selectedMonth],
  );

  const { data, isLoading, isError } =
    useGetProductsCheckOutDashboard(currentRange);

  return (
    <div className="space-y-7">
      {isLoading || !data ? (
        <DashboardStatsSkeleton />
      ) : (
        <DashboardStats
          total_amount={data?.summary.total_amount}
          total_item={data?.summary.total_id_provider}
          total_quantity={data?.summary.total_quantity}
        />
      )}
      {isLoading || !data ? (
        <ProductTableSkeleton />
      ) : (
        <ProviderTable
          data={data ? data.items : []}
          setOpen={setOpen}
          setSelectedProviderId={setSelectedProviderId}
        />
      )}

      {/* DRAWER */}
      <ProviderDrawer
        open={open}
        onOpenChange={setOpen}
        providerId={selectedProviderId}
      />
    </div>
  );
};

export default ProductSoldPage;
