"use client";
import WishlistTable from "@/components/layout/wishlist/table";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetWishlist } from "@/features/wishlist/hook";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const WishList = () => {
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const t = useTranslations();
  const { data: wishlist, isLoading, isError } = useGetWishlist();

  const total =
    wishlist?.items
      ?.filter((item) => item.is_active)
      .reduce(
        (acc, item) =>
          acc + (localQuantities[item.id] ?? item.quantity) * item.final_price,
        0,
      ) ?? 0;

  return (
    <div className="mt-6 lg:px-0 px-4 container-padding">
      <div className="w-full lg:max-w-7xl mx-auto lg:p-6">
        <h1 className="text-secondary text-5xl font-bold text-center">
          {t("wishlist")}
        </h1>

        {isLoading || isError || !wishlist ? (
          <ProductTableSkeleton />
        ) : (
          <WishlistTable
            wishlist={wishlist}
            localQuantities={localQuantities}
            setLocalQuantities={setLocalQuantities}
            total={total}
            currentTable={t("wishlistProducts")}
          />
        )}
      </div>
    </div>
  );
};

export default WishList;
