import React, { useState } from "react";
import { ProductMarginHeader } from "./product-margin-header";
import { useGetProductsCheckOutDashboard } from "@/features/checkout/hook";
import { getMonthDateRange } from "@/lib/getMonthDateRange";
import { ProviderTable } from "../product-sold-tab/table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { ProductMarginTable } from "./table";
import { ProviderDrawer } from "../product-sold-tab/product-drawer";
import { formatLocal, getMonthRange } from "@/hooks/get-month-range-by-month";

const ProductMarginPage = () => {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const { start, end } = getMonthRange(year, month);

  const from_date = formatLocal(start);
  const to_date = formatLocal(end);

  const { data, isLoading, isError } = useGetProductsCheckOutDashboard({
    from_date,
    to_date,
  });

  return (
    <div className="space-y-6">
      <ProductMarginHeader
        month={month}
        year={year}
        setMonth={setMonth}
        setYear={setYear}
      />

      {!data || isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductMarginTable
          data={data}
          setOpen={setOpen}
          setSelectedProviderId={setSelectedProviderId}
        />
      )}

      <ProviderDrawer
        open={open}
        onOpenChange={setOpen}
        providerId={selectedProviderId}
      />
    </div>
  );
};

export default ProductMarginPage;
