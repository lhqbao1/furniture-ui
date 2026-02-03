import CategorySection from "@/components/layout/home/category-section";
import NewsletterVoucherSection from "@/components/layout/home/contact-voucher-section";
import FeaturedProducts from "@/components/layout/home/featured-products";

import { getProductByTag } from "@/features/products/api";
import { getVouchers } from "@/features/vouchers/api";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

export const revalidate = 60;
export const experimental_ppr = true;

export default async function HomePage() {
  const [trendingProducts, allProducts, voucherList] = await Promise.all([
    getProductByTag("TRENDING", {
      is_econelo: false,
      is_customer: true,
    }).catch(() => []),
    getProductByTag("BEST_SELLER", {
      is_econelo: false,
      is_customer: true,
    }).catch(() => []),
    getVouchers().catch(() => []),
  ]);

  return (
    <div id="home" className="w-full min-h-[200vh] flex flex-col items-center">
      <div className="md:w-[95%] xl:w-3/4 w-[95%]">
        <h1 className="sr-only">Prestige Home</h1> {/* CRITICAL FIRST PAINT */}
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <FeaturedProducts products={allProducts} />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <NewsletterVoucherSection />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          {" "}
          <CategorySection slug="spielzeug" />
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
    </div>
  );
}
