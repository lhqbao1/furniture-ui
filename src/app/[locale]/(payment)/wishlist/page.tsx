"use client";
import WishlistTable from "@/components/layout/wishlist/table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetWishlist } from "@/features/wishlist/hook";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Heart } from "lucide-react";

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
        <div className="rounded-3xl border bg-gradient-to-r from-[#f4faf6] via-white to-[#f9fdfb] px-6 py-8 md:px-10 md:py-10 shadow-sm mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-secondary text-3xl md:text-5xl font-bold">
                {t("wishlist")}
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                {t("wishlistSubtitle")}
              </p>
            </div>
            <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
              <Heart className="h-7 w-7 text-secondary" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <ProductTableSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <h3 className="text-xl font-semibold">{t("addToCartFail")}</h3>
          </div>
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
