// app/(website)/page.tsx
import { Suspense } from "react";
import TrendingProducts from "@/components/layout/home/trending";
import RecentViewed from "@/components/layout/home/recent-viewed";

import getQueryClient from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getAllProducts, getProductByTag } from "@/features/products/api";
import { getCartItems } from "@/features/cart/api";
import { getAllProductsSelect } from "@/features/product-group/api";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

export const revalidate = 60; // ISR: regenerate every 60 seconds

export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch Trending Products (Home page hero section)
  await queryClient.prefetchQuery({
    queryKey: ["products-by-tag", "Trending"],
    queryFn: () => getProductByTag("Trending"),
    staleTime: 60_000,
  });

  // Prefetch All Products (Later used by TrendingProducts)
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: () => getAllProducts(),
    staleTime: 60_000,
  });

  await queryClient.prefetchQuery({
    queryKey: ["all-products"],
    queryFn: () =>
      getAllProductsSelect({
        all_products: false,
        is_customer: true,
      }),
    staleTime: 60_000,
  });

  // Prefetch Cart Items (Client cart icon)
  await queryClient.prefetchQuery({
    queryKey: ["cart-items"],
    queryFn: () => getCartItems(),
    staleTime: 30_000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div
        id="home"
        className="w-full"
      >
        {/* Suspense fallback for trending section */}
        <Suspense
          fallback={
            <div className="p-10">
              <ProductGridSkeleton />
            </div>
          }
        >
          <TrendingProducts />
        </Suspense>

        <Suspense
          fallback={
            <div className="p-10">
              <ProductGridSkeleton />
            </div>
          }
        >
          <RecentViewed />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
