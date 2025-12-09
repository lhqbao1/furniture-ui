// // app/(website)/page.tsx
// import RecentViewed from "@/components/layout/home/recent-viewed";

// import { getAllProducts, getProductByTag } from "@/features/products/api";
// import { getCategoriesWithChildren } from "@/features/category/api";
// import FeaturedProducts from "@/components/layout/home/featured-products";

// export const revalidate = 60; // ISR – regenerate every 60s

// export default async function HomePage() {
//   // Fetch all data on server – NO hydration needed
//   const [categories, trendingProducts, allProducts, featuredProducts] =
//     await Promise.all([
//       getCategoriesWithChildren(),
//       getProductByTag("Trending"),
//       getAllProducts({
//         page_size: 24,
//       }),
//       getProductByTag("Featured"),
//     ]);

//   return (
//     <div
//       id="home"
//       className="w-full"
//     >
//       {/* Danh mục */}
//       {/* <ListCategoriesHome categories={categories} /> */}
//       <FeaturedProducts products={featuredProducts} />
//       {/* Sản phẩm trending */}
//       {/* <TrendingProducts products={allProducts.items} /> */}

//       {/* Đã xem gần đây (nếu có) */}
//       <RecentViewed products={trendingProducts} />
//     </div>
//   );
// }

// app/(website)/page.tsx
import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import FeaturedProducts from "@/components/layout/home/featured-products";
import RecentViewed from "@/components/layout/home/recent-viewed";

import { getCategoriesWithChildren } from "@/features/category/api";
import { getProductByTag, getAllProducts } from "@/features/products/api";

import getQueryClient from "@/lib/get-query-client";

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  const qc = getQueryClient();

  // ─────────────────────────────────────────────
  // 🚀 CRITICAL DATA (prerender ngay lập tức)
  // ─────────────────────────────────────────────
  const featuredProducts = await getProductByTag("Featured");

  // Save critical data into React Query
  qc.setQueryData(["featured-products"], featuredProducts);

  // ─────────────────────────────────────────────
  // ⏳ NON-CRITICAL DATA (stream sau qua Suspense)
  // ─────────────────────────────────────────────
  const categoriesPromise = getCategoriesWithChildren();
  const trendingPromise = getProductByTag("Trending");
  const allProductsPromise = getAllProducts({ page_size: 24 });

  const [categories, trendingProducts, allProducts] = await Promise.all([
    categoriesPromise,
    trendingPromise,
    allProductsPromise,
  ]);

  // Save into hydration cache
  qc.setQueryData(["categories-home"], categories);
  qc.setQueryData(["trending-products"], trendingProducts);
  qc.setQueryData(["all-products"], allProducts);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div
        id="home"
        className="w-full"
      >
        {/* CRITICAL FIRST PAINT */}
        <FeaturedProducts queryKey={["featured-products"]} />

        {/* STREAMING SECTION */}
        <Suspense fallback={<div className="mt-8">Loading…</div>}>
          <RecentViewed queryKey={["trending-products"]} />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
