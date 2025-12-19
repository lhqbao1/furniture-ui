import CategorySection from "@/components/layout/home/category-section";
import NewsletterVoucherSection from "@/components/layout/home/contact-voucher-section";
import FeaturedProducts from "@/components/layout/home/featured-products";
import RecentViewed from "@/components/layout/home/recent-viewed";
import VoucherSection from "@/components/layout/home/voucher-section/voucher-section";

import { getProductByTag, getAllProducts } from "@/features/products/api";
import { getVouchers } from "@/features/vouchers/api";

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  const [trendingProducts, allProducts, voucherList] = await Promise.all([
    getProductByTag("Trending").catch(() => []),
    getAllProducts({ page_size: 24 }).catch(() => ({
      items: [],
      total: 0,
    })),
    getVouchers().catch(() => []),
  ]);

  return (
    <div
      id="home"
      className="w-full"
    >
      {/* CRITICAL FIRST PAINT */}
      <FeaturedProducts products={allProducts.items} />

      {/* <VoucherSection vouchers={voucherList} /> */}

      <RecentViewed products={trendingProducts} />

      <NewsletterVoucherSection />
      <CategorySection slug="sofas" />

      <CategorySection slug="matratzen" />
      <CategorySection slug="gartenmoebel" />
      <CategorySection slug="zaeune-sichtschutz" />
      {/* STREAMING SECTION */}
    </div>
  );
}
