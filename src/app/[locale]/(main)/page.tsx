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
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import FeaturedProducts from "@/components/layout/home/featured-products";
import RecentViewed from "@/components/layout/home/recent-viewed";

import { getCategoriesWithChildren } from "@/features/category/api";
import { getProductByTag, getAllProducts } from "@/features/products/api";

import getQueryClient from "@/lib/get-query-client";

function toPlain(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  const [trendingProducts, allProducts] = await Promise.all([
    getProductByTag("Trending").catch(() => []),
    getAllProducts({ page_size: 24 }),
  ]);

  return (
    <div
      id="home"
      className="w-full"
    >
      {/* CRITICAL FIRST PAINT */}
      <FeaturedProducts products={allProducts.items} />

      {/* STREAMING SECTION */}
      <RecentViewed products={trendingProducts} />
    </div>
  );
}
