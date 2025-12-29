import AnimatedCarousel from "@/components/layout/home/3d-carousel";
import CategorySection from "@/components/layout/home/category-section";
import NewsletterVoucherSection from "@/components/layout/home/contact-voucher-section";
import FeaturedProducts from "@/components/layout/home/featured-products";
import RecentViewed from "@/components/layout/home/recent-viewed";

import { getProductByTag, getAllProducts } from "@/features/products/api";
import { getVouchers } from "@/features/vouchers/api";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  const [trendingProducts, allProducts, voucherList] = await Promise.all([
    getProductByTag("Trending", {
      is_econelo: false,
      is_customer: true,
    }).catch(() => []),
    getProductByTag("New", {
      is_econelo: false,
      is_customer: true,
    }).catch(() => []),
    getVouchers().catch(() => []),
  ]);

  return (
    <div
      id="home"
      className="w-full min-h-[200vh] flex flex-col items-center"
    >
      <div className="md:w-[95%] xl:w-3/4 w-[95%]">
        {" "}
        {/* CRITICAL FIRST PAINT */}
        <FeaturedProducts products={allProducts} />
        {/* <VoucherSection vouchers={voucherList} /> */}
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <RecentViewed products={trendingProducts} />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <NewsletterVoucherSection />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="sofas" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="matratzen" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="gartenmoebel" />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <CategorySection slug="zaeune-sichtschutz" />
        </Suspense>
      </div>

      {/* <AnimatedCarousel /> */}

      {/* STREAMING SECTION */}
    </div>
  );
}
