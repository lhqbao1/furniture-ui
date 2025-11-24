// app/(website)/page.tsx
import ListCategoriesHome from "@/components/layout/home/list-categories";
import TrendingProducts from "@/components/layout/home/trending";
import RecentViewed from "@/components/layout/home/recent-viewed";

import { getAllProducts, getProductByTag } from "@/features/products/api";
import { getCategoriesWithChildren } from "@/features/category/api";

export const revalidate = 60; // ISR – regenerate every 60s

export default async function HomePage() {
  // Fetch all data on server – NO hydration needed
  const [categories, trendingProducts, allProducts] = await Promise.all([
    getCategoriesWithChildren(),
    getProductByTag("Trending"),
    getAllProducts(),
  ]);

  return (
    <div
      id="home"
      className="w-full"
    >
      {/* Danh mục */}
      <ListCategoriesHome categories={categories} />

      {/* Sản phẩm trending */}
      <TrendingProducts products={allProducts.items} />

      {/* Đã xem gần đây (nếu có) */}
      <RecentViewed products={trendingProducts} />
    </div>
  );
}
